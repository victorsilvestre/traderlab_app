import { describe, expect, it, vi } from 'vitest';
import { completeSignOut } from './completeSignOut';

describe('completeSignOut', () => {
  it('clears the local session before returning to sign-in', async () => {
    const events: string[] = [];
    const auth = {
      signOut: vi.fn(async (options: { scope: 'local' }) => {
        events.push(`sign-out:${options.scope}`);
        return { error: null };
      }),
    };
    const navigation = {
      replace: vi.fn((path: string) => events.push(`replace:${path}`)),
      refresh: vi.fn(() => events.push('refresh')),
    };

    await completeSignOut(auth, navigation);

    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(events).toEqual(['sign-out:local', 'replace:/sign-in', 'refresh']);
  });

  it('does not redirect when clearing the local session fails', async () => {
    const auth = {
      signOut: vi.fn(async () => ({
        error: new Error('cookie storage failed'),
      })),
    };
    const navigation = {
      replace: vi.fn(),
      refresh: vi.fn(),
    };

    await expect(completeSignOut(auth, navigation)).rejects.toThrow(
      'cookie storage failed',
    );
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(navigation.refresh).not.toHaveBeenCalled();
  });
});
