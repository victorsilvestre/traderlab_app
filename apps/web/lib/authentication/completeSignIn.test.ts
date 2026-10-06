import { beforeEach, describe, expect, it, vi } from 'vitest';
import { completeSignIn } from './completeSignIn';

describe('completeSignIn', () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  beforeEach(() => fetchMock.mockReset());

  it.each(['student', 'mentor', 'administrator'] as const)(
    'establishes a %s session before replacing the route with the home page',
    async (role) => {
      const events: string[] = [];
      fetchMock.mockImplementation(async () => {
        events.push('session');
        return { ok: true, json: async () => ({}) };
      });
      const navigation = {
        replace: vi.fn((path: string) => events.push(`replace:${path}`)),
        refresh: vi.fn(() => events.push('refresh')),
      };

      await completeSignIn({ email: `${role}@example.com`, password: 'secret' }, navigation);

      expect(fetchMock).toHaveBeenCalledWith('/api/auth/sign-in', expect.objectContaining({ method: 'POST' }));
      expect(events).toEqual(['session', 'replace:/', 'refresh']);
    },
  );

  it('keeps the user on the login form when the server cannot persist the session', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'cookie storage failed' }),
    });
    const navigation = {
      replace: vi.fn(),
      refresh: vi.fn(),
    };

    await expect(completeSignIn({ email: 'ana@example.com', password: 'secret' }, navigation)).rejects.toThrow('cookie storage failed');
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(navigation.refresh).not.toHaveBeenCalled();
  });
});
