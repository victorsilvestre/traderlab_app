import { describe, expect, it, vi } from 'vitest';
import {
  completeAuthCallback,
  type AuthCallbackClient,
} from './completeAuthCallback';

function createAuth(session: unknown | null = null): AuthCallbackClient {
  let currentSession = session;
  return {
    exchangeCodeForSession: vi.fn(async () => {
      currentSession = { user: { id: 'user-1' } };
      return { error: null };
    }),
    setSession: vi.fn(async () => {
      currentSession = { user: { id: 'user-1' } };
      return { error: null };
    }),
    getSession: vi.fn(async () => ({
      data: { session: currentSession },
      error: null,
    })),
  };
}

describe('completeAuthCallback', () => {
  it('persists implicit-flow tokens from the confirmation fragment', async () => {
    const auth = createAuth();
    const result = await completeAuthCallback(
      auth,
      'http://localhost:3000/auth/callback#access_token=access&refresh_token=refresh&type=signup',
    );

    expect(auth.setSession).toHaveBeenCalledWith({
      access_token: 'access',
      refresh_token: 'refresh',
    });
    expect(result).toEqual({ next: '/', error: null });
  });

  it('exchanges a PKCE code and permits only a local next route', async () => {
    const auth = createAuth();
    const result = await completeAuthCallback(
      auth,
      'http://localhost:3000/auth/callback?code=one-time-code&next=%2Fpassword-reset',
    );

    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith('one-time-code');
    expect(result).toEqual({ next: '/password-reset', error: null });

    const externalRedirect = await completeAuthCallback(
      createAuth({ user: { id: 'user-1' } }),
      'http://localhost:3000/auth/callback?next=https%3A%2F%2Fevil.example',
    );
    expect(externalRedirect.next).toBe('/');
  });

  it('shows the provider error when the confirmation URL contains an expired-link response', async () => {
    const auth = createAuth();
    const result = await completeAuthCallback(
      auth,
      'http://localhost:3000/auth/callback#error=access_denied&error_description=Email+link+is+invalid+or+has+expired',
    );

    expect(auth.setSession).not.toHaveBeenCalled();
    expect(result.error).toBe('Email link is invalid or has expired');
  });
});
