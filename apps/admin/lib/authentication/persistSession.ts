import { createBrowserClient } from '@supabase/ssr';
import type { SignInDto } from '@traderlab/contracts';
import { cookies } from 'next/headers';

export async function persistSession(
  result: SignInDto,
  email: string,
): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      isSingleton: false,
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, { ...options, domain: undefined }),
          );
        },
      },
    },
  );
  const storage = supabase.auth as unknown as {
    storageKey: string;
    storage: { setItem(key: string, value: string): Promise<void> };
  };
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = result.session.expiresAt ?? now + 3600;
  await storage.storage.setItem(
    storage.storageKey,
    JSON.stringify({
      access_token: result.session.accessToken,
      refresh_token: result.session.refreshToken,
      expires_in: Math.max(expiresAt - now, 0),
      expires_at: expiresAt,
      token_type: 'bearer',
      user: {
        id: result.user.id,
        aud: 'authenticated',
        role: 'authenticated',
        email,
        phone: result.user.phone,
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { name: result.user.name, phone: result.user.phone },
      },
    }),
  );
}
