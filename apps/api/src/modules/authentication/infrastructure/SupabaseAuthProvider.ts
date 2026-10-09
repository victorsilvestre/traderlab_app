import { createClient, type User } from '@supabase/supabase-js';
import type {
  AuthenticationProvider,
  AuthenticatedIdentity,
  SignInResult,
} from '../application/AuthenticationProvider.js';

const supabaseUrl = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_ANON_KEY;
const secretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !publishableKey || !secretKey) {
  throw new Error(
    'SUPABASE_URL, SUPABASE_ANON_KEY and a server secret key are required.',
  );
}

const authOptions = {
  autoRefreshToken: false,
  detectSessionInUrl: false,
  flowType: 'implicit' as const,
  persistSession: false,
};

const authFetch: typeof fetch = (input, init) => {
  const timeoutSignal = AbortSignal.timeout(8000);
  const signal = init?.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal;
  return fetch(input, { ...init, signal });
};

const publicClient = createClient(supabaseUrl, publishableKey, {
  auth: authOptions,
  global: { fetch: authFetch },
});
const adminClient = createClient(supabaseUrl, secretKey, {
  auth: authOptions,
  global: { fetch: authFetch },
});

function metadataText(user: User, field: string): string | null {
  const value = user.user_metadata?.[field];
  return typeof value === 'string' ? value : null;
}

function toIdentity(user: User): AuthenticatedIdentity {
  return {
    id: user.id,
    email: user.email ?? null,
    emailConfirmed: Boolean(user.email_confirmed_at),
    name: metadataText(user, 'name') ?? metadataText(user, 'full_name'),
    phone: metadataText(user, 'phone'),
    avatarUrl: metadataText(user, 'avatar_url') ?? metadataText(user, 'picture'),
    providers: Array.isArray(user.app_metadata?.providers)
      ? user.app_metadata.providers.filter((provider): provider is string => typeof provider === 'string')
      : typeof user.app_metadata?.provider === 'string' ? [user.app_metadata.provider] : [],
  };
}

export class SupabaseAuthProvider implements AuthenticationProvider {
  async listAll() {
    const perPage = 1000;
    const users: Array<{
      id: string;
      email: string | null;
    }> = [];
    for (let page = 1; ; page += 1) {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage,
      });
      if (error) throw error;
      users.push(
        ...data.users.map((user) => ({
          id: user.id,
          email: user.email ?? null,
        })),
      );
      if (data.users.length < perPage) return users;
    }
  }

  async signUp(input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    emailRedirectTo: string;
  }): Promise<AuthenticatedIdentity | null> {
    const { data, error } = await publicClient.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { name: input.name, phone: input.phone },
        emailRedirectTo: input.emailRedirectTo,
      },
    });

    if (error) throw error;
    if (!data.user || data.user.identities?.length === 0) return null;

    return toIdentity(data.user);
  }

  async signIn(email: string, password: string): Promise<SignInResult> {
    const { data, error } = await publicClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      throw error ?? new Error('Supabase did not return an authenticated session.');
    }

    return {
      identity: toIdentity(data.user),
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at ?? null,
      },
    };
  }

  async resendConfirmation(email: string, redirectTo: string): Promise<void> {
    const { error } = await publicClient.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw error;
  }

  async requestPasswordRecovery(
    email: string,
    redirectTo: string,
  ): Promise<void> {
    const { error } = await publicClient.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
  }

  async getIdentity(accessToken: string): Promise<AuthenticatedIdentity | null> {
    const { data, error } = await publicClient.auth.getUser(accessToken);
    if (error) {
      if (error.status === 401 || error.status === 403) return null;
      throw error;
    }
    if (!data.user) return null;
    return toIdentity(data.user);
  }

  async updatePassword(userId: string, password: string): Promise<void> {
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      password,
    });
    if (error) throw error;
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) throw error;
  }
}
