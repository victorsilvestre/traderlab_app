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
import { SupabaseCourseMaterialStorage } from './modules/course/infrastructure/SupabaseCourseMaterialStorage.js';
import { SupabaseCourseImageStorage } from './modules/course/infrastructure/SupabaseCourseImageStorage.js';
import { courseRoutes } from './modules/course/presentation/course.routes.js';
import { CourseManagementService } from './modules/course/application/CourseManagementService.js';
import { PrismaCourseManagementRepository } from './modules/course/infrastructure/PrismaCourseManagementRepository.js';
import { courseManagementRoutes } from './modules/course/presentation/courseManagement.routes.js';
import { ContentProgressService } from './modules/progress/application/ContentProgressService.js';
import { PrismaContentProgressRepository } from './modules/progress/infrastructure/PrismaContentProgressRepository.js';
import { progressRoutes } from './modules/progress/presentation/progress.routes.js';
import { HomeBannerService } from './modules/notification/application/HomeBannerService.js';
import { HomeBannerError } from './modules/notification/domain/HomeBannerError.js';
import { PrismaHomeBannerRepository } from './modules/notification/infrastructure/PrismaHomeBannerRepository.js';
import { homeBannerRoutes } from './modules/notification/presentation/homeBanner.routes.js';
import { NotificationService } from './modules/notification/application/NotificationService.js';
import { NotificationError } from './modules/notification/domain/NotificationError.js';
import { PrismaNotificationRepository } from './modules/notification/infrastructure/PrismaNotificationRepository.js';
import { notificationRoutes } from './modules/notification/presentation/notification.routes.js';
import { UserService } from './modules/user/application/UserService.js';
import { PrismaUserProfileRepository as UserProfileEditRepository } from './modules/user/infrastructure/PrismaUserProfileRepository.js';
import { SupabaseProfileAvatarStorage } from './modules/user/infrastructure/SupabaseProfileAvatarStorage.js';
import { userRoutes } from './modules/user/presentation/user.routes.js';
import { UserError } from './modules/user/domain/UserError.js';
import { EnrollmentService } from './modules/enrollment/application/EnrollmentService.js';
import { EnrollmentError } from './modules/enrollment/domain/EnrollmentError.js';
import { PrismaEnrollmentRepository } from './modules/enrollment/infrastructure/PrismaEnrollmentRepository.js';
import { enrollmentRoutes } from './modules/enrollment/presentation/enrollment.routes.js';

const configuredWebAppUrl = process.env.WEB_APP_URL;
if (!configuredWebAppUrl) {
  throw new Error('WEB_APP_URL is required to start the API.');
}
const webAppUrl = configuredWebAppUrl.replace(/\/$/, '');
const adminAppUrl = process.env.ADMIN_APP_URL?.replace(/\/$/, '');

export function createApp() {
  const app = Fastify({ logger: true });
  const authenticationProvider = new SupabaseAuthProvider();
  const profileAvatars = new SupabaseProfileAvatarStorage();
  const service = new AuthenticationService(
    authenticationProvider,
    new PrismaUserProfileRepository(),
    webAppUrl,
    adminAppUrl,
    profileAvatars,
  );
  const progressService = new ContentProgressService(
    new PrismaContentProgressRepository(),
  );
  const courseImageStorage = new SupabaseCourseImageStorage();
  const homeBannerService = new HomeBannerService(
    new PrismaHomeBannerRepository(),
    courseImageStorage,
    webAppUrl,
  );
  const notificationService = new NotificationService(
    new PrismaNotificationRepository(),
    authenticationProvider,
  );
  const userService = new UserService(
    new UserProfileEditRepository(),
    profileAvatars,
  );
  const courseService = new CourseService(
    new PrismaCourseRepository(),
    new RequireCourseAccess(new PrismaCourseAccessRepository()),
    progressService,
    new SupabaseCourseMaterialStorage(),
    courseImageStorage,
  );
  const courseManagementService = new CourseManagementService(
    new PrismaCourseManagementRepository(),
    new SupabaseCourseImageStorage(),
    new SupabaseCourseMaterialStorage(),
  );
  const enrollmentService = new EnrollmentService(new PrismaEnrollmentRepository());

  void app.register(cors, {
    origin: adminAppUrl ? [webAppUrl, adminAppUrl] : webAppUrl,
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['authorization', 'content-type'],
  });
  void app.register(authenticationRoutes, { service });
  void app.register(courseRoutes, {
    authentication: service,
    service: courseService,
  });
  void app.register(courseManagementRoutes, {
    authentication: service,
    service: courseManagementService,
  });
  void app.register(progressRoutes, {
    authentication: service,
    service: progressService,
  });
  void app.register(homeBannerRoutes, {
    authentication: service,
    service: homeBannerService,
  });
  void app.register(notificationRoutes, {
    authentication: service,
    service: notificationService,
  });
  void app.register(userRoutes, {
    authentication: service,
    service: userService,
  });
  void app.register(enrollmentRoutes, {
    authentication: service,
    service: enrollmentService,
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
    if (error instanceof UserError) {
      return reply.code(error.statusCode).send({ message: error.message });
    }
    if (error instanceof CourseError) {
      return reply.code(error.statusCode).send({ message: error.message });
    }
    if (error instanceof NotificationError) {
      return reply.code(error.statusCode).send({ message: error.message });
    }
    if (error instanceof HomeBannerError) {
      return reply.code(error.statusCode).send({ message: error.message });
    }
    if (error instanceof EnrollmentError) {
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
