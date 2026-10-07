import { describe, expect, it } from 'vitest';
import { isSameOrigin } from './requestOrigin';

function request(origin: string | null, host = 'admin.localhost:3001') {
  const headers = new Headers({
    host,
    'x-forwarded-host': host,
    'x-forwarded-proto': 'http',
  });
  if (origin) headers.set('origin', origin);
  return new Request('http://localhost:3001/api/auth/sign-in', { headers });
}

describe('admin request origin', () => {
  it('accepts the public host even when Next normalizes the internal request URL', () => {
    expect(isSameOrigin(request('http://admin.localhost:3001'))).toBe(true);
  });

  it('rejects missing, foreign, or downgraded origins', () => {
    expect(isSameOrigin(request(null))).toBe(false);
    expect(isSameOrigin(request('https://other.example'))).toBe(false);
    expect(isSameOrigin(request('https://admin.localhost:3001'))).toBe(false);
  });
});
