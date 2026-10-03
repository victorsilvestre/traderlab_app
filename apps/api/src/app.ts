import cors from '@fastify/cors';
import Fastify from 'fastify';
import { AuthenticationService } from './modules/authentication/application/AuthenticationService.js';
import { AuthenticationError } from './modules/authentication/domain/AuthenticationError.js';
import { PrismaUserProfileRepository } from './modules/authentication/infrastructure/PrismaUserProfileRepository.js';
import { SupabaseAuthProvider } from './modules/authentication/infrastructure/SupabaseAuthProvider.js';
import { authenticationRoutes } from './modules/authentication/presentation/authentication.routes.js';

const configuredWebAppUrl = process.env.WEB_APP_URL;
if (!configuredWebAppUrl) {
  throw new Error('WEB_APP_URL is required to start the API.');
}
const webAppUrl = configuredWebAppUrl.replace(/\/$/, '');

export function createApp() {
  const app = Fastify({ logger: true });
  const service = new AuthenticationService(
    new SupabaseAuthProvider(),
    new PrismaUserProfileRepository(),
    webAppUrl,
  );

  void app.register(cors, {
    origin: webAppUrl,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['authorization', 'content-type'],
  });
  void app.register(authenticationRoutes, { service });

  app.get('/health', async () => ({ status: 'ok' as const }));

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AuthenticationError) {
      if (error.cause) {
        const cause = error.cause;
        const details =
          cause instanceof Error
            ? {
                name: cause.name,
                message: cause.message,
                ...(typeof (cause as Error & { status?: unknown }).status === 'number'
                  ? { status: (cause as Error & { status: number }).status }
                  : {}),
                ...(typeof (cause as Error & { code?: unknown }).code === 'string'
                  ? { code: (cause as Error & { code: string }).code }
                  : {}),
              }
            : { message: 'Non-error value from authentication provider' };
        request.log.error({ providerError: details }, 'Authentication provider request failed');
      }
      return reply.code(error.statusCode).send({ message: error.message });
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'validation' in error &&
      error.validation
    ) {
      return reply.code(400).send({ message: 'Confira os campos informados.' });
    }

    request.log.error({ err: error }, 'Authentication request failed');
    return reply.code(500).send({ message: 'Não foi possível concluir a solicitação.' });
  });

  return app;
}
