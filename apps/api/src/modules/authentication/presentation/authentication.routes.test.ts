import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticationService } from '../application/AuthenticationService.js';
import { authenticationRoutes } from './authentication.routes.js';

let app: ReturnType<typeof Fastify>;
const service = {
  signUp: vi.fn(async (_input: unknown) => ({ message: 'confirmation sent' })),
  signIn: vi.fn(async () => ({ session: {}, user: {} })),
  signInForWorkspace: vi.fn(async () => ({ session: {}, user: {} })),
  requestPasswordRecovery: vi.fn(async () => ({ message: 'recovery sent' })),
  resendConfirmation: vi.fn(async () => ({ message: 'confirmation sent' })),
  resetPassword: vi.fn(async () => ({ message: 'password updated' })),
  getCurrentUser: vi.fn(async () => ({ id: 'user-1' })),
  getCurrentWorkspaceUser: vi.fn(async () => ({ id: 'user-1', role: 'mentor' })),
};

afterEach(() => vi.clearAllMocks());
afterEach(async () => app.close());

beforeEach(async () => {
  app = Fastify();
  await app.register(async (instance: FastifyInstance) => {
    await authenticationRoutes(instance, {
      service: service as unknown as AuthenticationService,
    });
  });
  await app.ready();
});

describe('authentication routes', () => {
  it('validates registration fields at the API boundary', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/authentication/sign-up',
      payload: { email: 'not-an-email' },
    });

    expect(response.statusCode).toBe(400);
    expect(service.signUp).not.toHaveBeenCalled();
  });

  it('strips a public role assignment before calling registration', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/authentication/sign-up',
      payload: {
        name: 'Ana Trader',
        email: 'ana@example.com',
        phone: '+5511999999999',
        password: 'secret123',
        passwordConfirmation: 'secret123',
        role: 'administrator',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(service.signUp).toHaveBeenCalledOnce();
    expect(service.signUp.mock.calls[0]?.[0]).not.toHaveProperty('role');
  });

  it('accepts valid registration input and returns 201', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/authentication/sign-up',
      payload: {
        name: 'Ana Trader',
        email: 'ana@example.com',
        phone: '+5511999999999',
        password: 'secret123',
        passwordConfirmation: 'secret123',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(service.signUp).toHaveBeenCalledOnce();
  });

  it('returns generic accepted responses for recovery and confirmation resend', async () => {
    const recovery = await app.inject({
      method: 'POST',
      url: '/authentication/password-recovery',
      payload: { email: 'ana@example.com' },
    });
    const confirmation = await app.inject({
      method: 'POST',
      url: '/authentication/email-confirmation',
      payload: { email: 'ana@example.com' },
    });

    expect(recovery.statusCode).toBe(202);
    expect(confirmation.statusCode).toBe(202);
  });

  it('routes workspace entry separately and rejects arbitrary email destinations', async () => {
    const entry = await app.inject({
      method: 'POST',
      url: '/authentication/workspace/sign-in',
      payload: { email: 'mentor@example.com', password: 'secret123' },
    });
    const invalidDestination = await app.inject({
      method: 'POST',
      url: '/authentication/password-recovery',
      payload: { email: 'mentor@example.com', destination: 'https://evil.example' },
    });
    expect(entry.statusCode).toBe(200);
    expect(service.signInForWorkspace).toHaveBeenCalledWith('mentor@example.com', 'secret123');
    expect(invalidDestination.statusCode).toBe(400);
    expect(service.requestPasswordRecovery).not.toHaveBeenCalled();
  });

  it('requires a bearer token for profile and password-reset routes', async () => {
    const profile = await app.inject({
      method: 'GET',
      url: '/authentication/me',
    });
    const workspaceProfile = await app.inject({
      method: 'GET',
      url: '/authentication/workspace/me',
    });
    const reset = await app.inject({
      method: 'POST',
      url: '/authentication/password-reset',
      payload: { password: 'new-secret', passwordConfirmation: 'new-secret' },
    });

    expect(profile.statusCode).toBe(401);
    expect(workspaceProfile.statusCode).toBe(401);
    expect(reset.statusCode).toBe(401);
    expect(service.getCurrentUser).not.toHaveBeenCalled();
    expect(service.getCurrentWorkspaceUser).not.toHaveBeenCalled();
    expect(service.resetPassword).not.toHaveBeenCalled();
  });
});
