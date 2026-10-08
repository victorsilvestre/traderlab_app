import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticationService } from './AuthenticationService.js';
import type {
  AuthenticationProvider,
  AuthenticatedIdentity,
  SignInResult,
} from './AuthenticationProvider.js';
import type { UserProfileRepository } from '../domain/UserProfile.js';

const identity: AuthenticatedIdentity = {
  id: 'auth-user-1',
  email: 'student@example.com',
  emailConfirmed: true,
  name: 'Ana Trader',
  phone: '+5511999999999',
};

const session: SignInResult = {
  identity,
  session: {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresAt: 123456,
  },
};

function setup() {
  const provider: AuthenticationProvider = {
    signUp: vi.fn(async () => identity),
    resendConfirmation: vi.fn(async () => undefined),
    signIn: vi.fn(async () => session),
    requestPasswordRecovery: vi.fn(async () => undefined),
    getIdentity: vi.fn(async () => identity),
    updatePassword: vi.fn(async () => undefined),
    deleteUser: vi.fn(async () => undefined),
  };
  const profile = {
    id: identity.id,
    name: identity.name!,
    phone: identity.phone!,
    role: 'student' as const,
  };
  const profiles: UserProfileRepository = {
    createForStudent: vi.fn(async () => profile),
    findById: vi.fn(async () => profile),
    recordSuccessfulLogin: vi.fn(async () => undefined),
  };

  return {
    provider,
    profiles,
    service: new AuthenticationService(
      provider,
      profiles,
      'http://localhost:3000',
      'http://admin.localhost:3001',
    ),
  };
}

const signUpInput = {
  name: ' Ana Trader ',
  email: ' STUDENT@EXAMPLE.COM ',
  phone: ' +5511999999999 ',
  password: 'secret123',
  passwordConfirmation: 'secret123',
};

describe('AuthenticationService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('normalizes registration data and creates a student profile', async () => {
    const { provider, profiles, service } = setup();

    const result = await service.signUp(signUpInput);

    expect(provider.signUp).toHaveBeenCalledWith({
      name: 'Ana Trader',
      email: 'student@example.com',
      phone: '+5511999999999',
      password: 'secret123',
      emailRedirectTo: 'http://localhost:3000/auth/callback',
    });
    expect(profiles.createForStudent).toHaveBeenCalledWith({
      id: identity.id,
      name: identity.name,
      phone: identity.phone,
      email: identity.email,
    });
    expect(result.message).toContain('e-mail');
  });

  it('rejects short or mismatched passwords before contacting Supabase', async () => {
    const { provider, service } = setup();

    await expect(
      service.signUp({
        ...signUpInput,
        password: '12345',
        passwordConfirmation: '12345',
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      service.signUp({ ...signUpInput, passwordConfirmation: 'different' }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(provider.signUp).not.toHaveBeenCalled();
  });

  it('removes the Supabase identity if profile persistence fails', async () => {
    const { provider, profiles, service } = setup();
    vi.mocked(profiles.createForStudent).mockRejectedValueOnce(
      new Error('db down'),
    );

    await expect(service.signUp(signUpInput)).rejects.toMatchObject({
      statusCode: 503,
    });
    expect(provider.deleteUser).toHaveBeenCalledWith(identity.id);
  });

  it('does not issue a session before email confirmation', async () => {
    const { provider, profiles, service } = setup();
    vi.mocked(provider.signIn).mockResolvedValueOnce({
      ...session,
      identity: { ...identity, emailConfirmed: false },
    });

    await expect(
      service.signIn(identity.email!, 'secret123'),
    ).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(profiles.findById).not.toHaveBeenCalled();
  });

  it('returns the authenticated session and trusted student profile', async () => {
    const { profiles, service } = setup();
    const result = await service.signIn(' STUDENT@EXAMPLE.COM ', 'secret123');

    expect(result.session.accessToken).toBe(session.session.accessToken);
    expect(result.user).toEqual({
      id: identity.id,
      name: identity.name,
      phone: identity.phone,
      role: 'student',
    });
    expect(profiles.findById).toHaveBeenCalledWith(identity.id);
  });

  it('admits existing mentors and administrators without creating a student profile', async () => {
    const { profiles, service } = setup();
    for (const role of ['mentor', 'administrator'] as const) {
      vi.mocked(profiles.findById).mockResolvedValueOnce({
        id: identity.id, name: identity.name!, phone: identity.phone!, role,
      });
      const result = await service.signInForWorkspace(identity.email!, 'secret123');
      expect(result.user.role).toBe(role);
      expect(result.session.accessToken).toBe(session.session.accessToken);
    }
    expect(profiles.createForStudent).not.toHaveBeenCalled();
  });

  it('denies workspace tokens to students and identities without a profile', async () => {
    const { profiles, service } = setup();
    await expect(service.signInForWorkspace(identity.email!, 'secret123'))
      .rejects.toMatchObject({ statusCode: 403 });
    vi.mocked(profiles.findById).mockResolvedValueOnce(null);
    await expect(service.signInForWorkspace(identity.email!, 'secret123'))
      .rejects.toMatchObject({ statusCode: 403 });
    expect(profiles.createForStudent).not.toHaveBeenCalled();
  });

  it('requires email confirmation before workspace access', async () => {
    const { provider, profiles, service } = setup();
    vi.mocked(provider.signIn).mockResolvedValueOnce({
      ...session, identity: { ...identity, emailConfirmed: false },
    });
    await expect(service.signInForWorkspace(identity.email!, 'secret123'))
      .rejects.toMatchObject({ statusCode: 403 });
    expect(profiles.findById).not.toHaveBeenCalled();
  });

  it('checks the current workspace role without recreating a missing profile', async () => {
    const { profiles, service } = setup();
    vi.mocked(profiles.findById).mockResolvedValueOnce({
      id: identity.id, name: identity.name!, phone: identity.phone!, role: 'mentor',
    });
    expect((await service.getCurrentWorkspaceUser('access-token')).role).toBe('mentor');
    vi.mocked(profiles.findById).mockResolvedValueOnce(null);
    await expect(service.getCurrentWorkspaceUser('access-token'))
      .rejects.toMatchObject({ statusCode: 403 });
    expect(profiles.createForStudent).not.toHaveBeenCalled();
  });

  it('returns a generic error for invalid sign-in credentials', async () => {
    const { provider, profiles, service } = setup();
    vi.mocked(provider.signIn).mockRejectedValueOnce(
      Object.assign(new Error('invalid password'), { status: 400 }),
    );

    await expect(
      service.signIn(identity.email!, 'wrong-password'),
    ).rejects.toMatchObject({
      statusCode: 401,
      message:
        'Não foi possível entrar. Confira seus dados e a confirmação do e-mail.',
    });
    expect(profiles.findById).not.toHaveBeenCalled();
  });

  it('sends generic recovery and confirmation responses without account details', async () => {
    const { provider, service } = setup();

    const recovery = await service.requestPasswordRecovery(
      ' STUDENT@EXAMPLE.COM ',
    );
    const confirmation = await service.resendConfirmation(
      ' STUDENT@EXAMPLE.COM ',
    );

    expect(provider.requestPasswordRecovery).toHaveBeenCalledWith(
      'student@example.com',
      'http://localhost:3000/auth/callback?next=/password-reset',
    );
    expect(provider.resendConfirmation).toHaveBeenCalledWith(
      'student@example.com',
      'http://localhost:3000/auth/callback',
    );
    expect(recovery.message).not.toContain(identity.email!);
    expect(confirmation.message).not.toContain(identity.email!);
  });

  it('uses only the configured admin origin for admin email callbacks', async () => {
    const { provider, service } = setup();
    await service.requestPasswordRecovery(identity.email!, 'admin');
    await service.resendConfirmation(identity.email!, 'admin');
    expect(provider.requestPasswordRecovery).toHaveBeenCalledWith(
      identity.email!, 'http://admin.localhost:3001/auth/callback?next=/password-reset',
    );
    expect(provider.resendConfirmation).toHaveBeenCalledWith(
      identity.email!, 'http://admin.localhost:3001/auth/callback',
    );
  });

  it('keeps the provider failure available for server diagnostics without changing the user message', async () => {
    const { provider, service } = setup();
    const providerFailure = Object.assign(new Error('email_address_not_authorized'), {
      status: 403,
      code: 'email_address_not_authorized',
    });
    vi.mocked(provider.requestPasswordRecovery).mockRejectedValueOnce(providerFailure);

    await expect(service.requestPasswordRecovery(identity.email!)).rejects.toMatchObject({
      statusCode: 503,
      message: 'Não foi possível processar a solicitação agora. Tente novamente.',
      cause: providerFailure,
    });
  });

  it('explains the temporary Supabase email rate limit during recovery', async () => {
    const { provider, service } = setup();
    vi.mocked(provider.requestPasswordRecovery).mockRejectedValueOnce(
      Object.assign(new Error('email rate limit exceeded'), {
        status: 429,
        code: 'over_email_send_rate_limit',
      }),
    );

    await expect(service.requestPasswordRecovery(identity.email!)).rejects.toMatchObject({
      statusCode: 429,
      message:
        'O serviço de e-mail atingiu o limite temporário de envios. Aguarde um pouco antes de tentar novamente.',
    });
  });

  it('updates a password only for a valid recovery session', async () => {
    const { provider, service } = setup();

    await service.resetPassword({
      accessToken: 'access-token',
      password: 'new-secret',
      passwordConfirmation: 'new-secret',
    });

    expect(provider.getIdentity).toHaveBeenCalledWith('access-token');
    expect(provider.updatePassword).toHaveBeenCalledWith(
      identity.id,
      'new-secret',
    );
  });

  it('rejects mismatched or expired password-reset requests', async () => {
    const { provider, service } = setup();

    await expect(
      service.resetPassword({
        accessToken: 'access-token',
        password: 'new-secret',
        passwordConfirmation: 'different',
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(provider.getIdentity).not.toHaveBeenCalled();

    vi.mocked(provider.getIdentity).mockResolvedValueOnce(null);
    await expect(
      service.resetPassword({
        accessToken: 'expired-token',
        password: 'new-secret',
        passwordConfirmation: 'new-secret',
      }),
    ).rejects.toMatchObject({ statusCode: 401 });
    expect(provider.updatePassword).not.toHaveBeenCalled();
  });
});
