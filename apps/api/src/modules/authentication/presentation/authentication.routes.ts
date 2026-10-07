import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AuthenticationService } from '../application/AuthenticationService.js';
import { AuthenticationError } from '../domain/AuthenticationError.js';

type SignUpBody = {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
};

type SignInBody = { email: string; password: string };
type RecoveryBody = { email: string; destination?: 'web' | 'admin' };
type ResetBody = { password: string; passwordConfirmation: string };

const emailSchema = { type: 'string', format: 'email', maxLength: 254 } as const;

function bearerToken(request: FastifyRequest): string {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AuthenticationError('Entre novamente para continuar.', 401);
  }
  return header.slice('Bearer '.length);
}

export async function authenticationRoutes(
  app: FastifyInstance,
  options: { service: AuthenticationService },
): Promise<void> {
  app.post<{ Body: SignUpBody }>(
    '/authentication/sign-up',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'email', 'phone', 'password', 'passwordConfirmation'],
          additionalProperties: false,
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 120 },
            email: emailSchema,
            phone: { type: 'string', minLength: 5, maxLength: 30 },
            password: { type: 'string', minLength: 6, maxLength: 128 },
            passwordConfirmation: { type: 'string', minLength: 1, maxLength: 128 },
          },
        },
      },
    },
    async (request, reply) =>
      reply.code(201).send(await options.service.signUp(request.body)),
  );

  app.post<{ Body: SignInBody }>(
    '/authentication/sign-in',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          additionalProperties: false,
          properties: {
            email: emailSchema,
            password: { type: 'string', minLength: 1, maxLength: 128 },
          },
        },
      },
    },
    async (request, reply) =>
      reply.send(
        await options.service.signIn(request.body.email, request.body.password),
      ),
  );

  app.post<{ Body: SignInBody }>(
    '/authentication/workspace/sign-in',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          additionalProperties: false,
          properties: {
            email: emailSchema,
            password: { type: 'string', minLength: 1, maxLength: 128 },
          },
        },
      },
    },
    async (request, reply) =>
      reply.send(
        await options.service.signInForWorkspace(request.body.email, request.body.password),
      ),
  );

  app.post<{ Body: RecoveryBody }>(
    '/authentication/password-recovery',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email'],
          additionalProperties: false,
          properties: {
            email: emailSchema,
            destination: { type: 'string', enum: ['web', 'admin'] },
          },
        },
      },
    },
    async (request, reply) =>
      reply.code(202).send(
        await options.service.requestPasswordRecovery(
          request.body.email,
          request.body.destination,
        ),
      ),
  );

  app.post<{ Body: RecoveryBody }>(
    '/authentication/email-confirmation',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email'],
          additionalProperties: false,
          properties: {
            email: emailSchema,
            destination: { type: 'string', enum: ['web', 'admin'] },
          },
        },
      },
    },
    async (request, reply) =>
      reply.code(202).send(
        await options.service.resendConfirmation(
          request.body.email,
          request.body.destination,
        ),
      ),
  );

  app.post<{ Body: ResetBody }>(
    '/authentication/password-reset',
    {
      schema: {
        body: {
          type: 'object',
          required: ['password', 'passwordConfirmation'],
          additionalProperties: false,
          properties: {
            password: { type: 'string', minLength: 6, maxLength: 128 },
            passwordConfirmation: { type: 'string', minLength: 1, maxLength: 128 },
          },
        },
      },
    },
    async (request, reply) =>
      reply.send(
        await options.service.resetPassword({
          ...request.body,
          accessToken: bearerToken(request),
        }),
      ),
  );

  app.get('/authentication/me', async (request, reply) =>
    reply.send(await options.service.getCurrentUser(bearerToken(request))),
  );

  app.get('/authentication/workspace/me', async (request, reply) =>
    reply.send(await options.service.getCurrentWorkspaceUser(bearerToken(request))),
  );
}
