import cors from '@fastify/cors';
import Fastify from 'fastify';
import { AuthenticationService } from './modules/authentication/application/AuthenticationService.js';
import { AuthenticationError } from './modules/authentication/domain/AuthenticationError.js';
import { PrismaUserProfileRepository } from './modules/authentication/infrastructure/PrismaUserProfileRepository.js';
import { SupabaseAuthProvider } from './modules/authentication/infrastructure/SupabaseAuthProvider.js';
import { authenticationRoutes } from './modules/authentication/presentation/authentication.routes.js';
import { RequireCourseAccess } from './modules/access/application/RequireCourseAccess.js';
import { CourseAccessError } from './modules/access/domain/CourseAccessError.js';
import { PrismaCourseAccessRepository } from './modules/access/infrastructure/PrismaCourseAccessRepository.js';
import { CourseService } from './modules/course/application/CourseService.js';
import { CourseError } from './modules/course/domain/CourseError.js';
import { PrismaCourseRepository } from './modules/course/infrastructure/PrismaCourseRepository.js';
import { courseRoutes } from './modules/course/presentation/course.routes.js';
import { ContentProgressService } from './modules/progress/application/ContentProgressService.js';
import { PrismaContentProgressRepository } from './modules/progress/infrastructure/PrismaContentProgressRepository.js';

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
  const courseService = new CourseService(
    new PrismaCourseRepository(),
    new RequireCourseAccess(new PrismaCourseAccessRepository()),
    new ContentProgressService(new PrismaContentProgressRepository()),
  );

  void app.register(cors, {
    origin: webAppUrl,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['authorization', 'content-type'],
  });
  void app.register(authenticationRoutes, { service });
  void app.register(courseRoutes, {
    authentication: service,
    service: courseService,
  });

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
                ...(typeof (cause as Error & { status?: unknown }).status ===
                'number'
                  ? { status: (cause as Error & { status: number }).status }
                  : {}),
                ...(typeof (cause as Error & { code?: unknown }).code ===
                'string'
                  ? { code: (cause as Error & { code: string }).code }
                  : {}),
              }
            : { message: 'Non-error value from authentication provider' };
        request.log.error(
          { providerError: details },
          'Authentication provider request failed',
        );
      }
      return reply.code(error.statusCode).send({ message: error.message });
    }
    if (error instanceof CourseError) {
      return reply.code(error.statusCode).send({ message: error.message });
    }
    if (error instanceof CourseAccessError) {
      return reply.code(404).send({ message: 'Curso não encontrado.' });
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
    return reply
      .code(500)
      .send({ message: 'Não foi possível concluir a solicitação.' });
  });

  return app;
}
