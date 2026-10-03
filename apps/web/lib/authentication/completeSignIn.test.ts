import { describe, expect, it, vi } from 'vitest';
import type { SignInDto } from '@traderlab/contracts';
import { completeSignIn } from './completeSignIn';

const result: SignInDto = {
  session: {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresAt: 123456,
  },
  user: {
    id: 'auth-user-1',
    name: 'Ana Trader',
    phone: '+5511999999999',
    role: 'student',
  },
};

describe('completeSignIn', () => {
  it.each(['student', 'mentor', 'administrator'] as const)(
    'persists a %s session before replacing the route with the home page',
    async (role) => {
      const events: string[] = [];
      const auth = {
        setSession: vi.fn(async () => {
          events.push('session');
          return { error: null };
        }),
      };
      const navigation = {
        replace: vi.fn((path: string) => events.push(`replace:${path}`)),
        refresh: vi.fn(() => events.push('refresh')),
      };

      await completeSignIn(
        { ...result, user: { ...result.user, role } },
        auth,
        navigation,
      );

      expect(auth.setSession).toHaveBeenCalledWith({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });
      expect(events).toEqual(['session', 'replace:/', 'refresh']);
    },
  );

  it('keeps the user on the login form when the browser cannot persist the session', async () => {
    const auth = {
      setSession: vi.fn(async () => ({
        error: new Error('cookie storage failed'),
      })),
    };
    const navigation = {
      replace: vi.fn(),
      refresh: vi.fn(),
    };

    await expect(completeSignIn(result, auth, navigation)).rejects.toThrow(
      'cookie storage failed',
    );
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(navigation.refresh).not.toHaveBeenCalled();
  });
});
