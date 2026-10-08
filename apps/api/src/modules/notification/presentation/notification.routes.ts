import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AuthenticationService } from '../../authentication/application/AuthenticationService.js';
import { AuthenticationError } from '../../authentication/domain/AuthenticationError.js';
import type { ManagedNotificationInputDto } from '@traderlab/contracts';
import type { NotificationService } from '../application/NotificationService.js';

type NotificationParams = { notificationId: number };
type NotificationQuery = {
  filter?: 'all' | 'unread';
  offset?: number;
  limit?: number;
};
type AdminNotificationQuery = { page?: number };
type AdminNotificationParams = { notificationId: number };

function accessToken(request: FastifyRequest): string {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AuthenticationError('Entre novamente para continuar.', 401);
  }
  return header.slice('Bearer '.length);
}

async function currentUserId(
  request: FastifyRequest,
  authentication: AuthenticationService,
) {
  const user = await authentication.getCurrentUser(accessToken(request));
  return user.id;
}

const notificationParamsSchema = {
  type: 'object',
  required: ['notificationId'],
  additionalProperties: false,
  properties: { notificationId: { type: 'integer', minimum: 1 } },
} as const;
const adminNotificationQuerySchema = {
  type: 'object',
  additionalProperties: false,
  properties: { page: { type: 'integer', minimum: 1, maximum: 100000 } },
} as const;
const adminNotificationParamsSchema = {
  type: 'object',
  required: ['notificationId'],
  additionalProperties: false,
  properties: { notificationId: { type: 'integer', minimum: 1 } },
} as const;
const adminNotificationBodySchema = {
  type: 'object',
  required: ['title', 'description', 'audience'],
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 180 },
    description: { type: 'string', minLength: 1, maxLength: 3000 },
    linkUrl: { anyOf: [{ type: 'string', maxLength: 2048 }, { type: 'null' }] },
    audience: { type: 'string', enum: ['general', 'course'] },
    courseId: {
      anyOf: [{ type: 'integer', minimum: 1 }, { type: 'null' }],
    },
  },
} as const;

export async function notificationRoutes(
  app: FastifyInstance,
  options: {
    authentication: AuthenticationService;
    service: NotificationService;
  },
): Promise<void> {
  app.get<{ Querystring: AdminNotificationQuery }>(
    '/admin/notifications',
    { schema: { querystring: adminNotificationQuerySchema } },
    async (request) => {
      await options.authentication.getCurrentAdministrator(accessToken(request));
      return options.service.listForAdmin(request.query.page ?? 1);
    },
  );

  app.get('/admin/notifications/courses', async (request) => {
    await options.authentication.getCurrentAdministrator(accessToken(request));
    return { items: await options.service.listCourses() };
  });

  app.get<{ Params: AdminNotificationParams; Querystring: AdminNotificationQuery }>(
    '/admin/notifications/:notificationId',
    {
      schema: {
        params: adminNotificationParamsSchema,
        querystring: adminNotificationQuerySchema,
      },
    },
    async (request) => {
      await options.authentication.getCurrentAdministrator(accessToken(request));
      return options.service.getAdminDetails(
        request.params.notificationId,
        request.query.page ?? 1,
      );
    },
  );

  app.post<{ Body: ManagedNotificationInputDto }>(
    '/admin/notifications',
    { schema: { body: adminNotificationBodySchema } },
    async (request, reply) => {
      const administrator = await options.authentication.getCurrentAdministrator(
        accessToken(request),
      );
      const created = await options.service.createAndSend(
        request.body,
        administrator.id,
      );
      return reply.code(201).send(created);
    },
  );

  app.get<{ Querystring: NotificationQuery }>(
    '/notifications',
    {
      schema: {
        querystring: {
          type: 'object',
          additionalProperties: false,
          properties: {
            filter: { type: 'string', enum: ['all', 'unread'] },
            offset: { type: 'integer', minimum: 0, maximum: 10000 },
            limit: { type: 'integer', minimum: 1, maximum: 50 },
          },
        },
      },
    },
    async (request) => {
      const userId = await currentUserId(request, options.authentication);
      return options.service.listForUser({
        userId,
        filter: request.query.filter ?? 'all',
        offset: request.query.offset ?? 0,
        limit: request.query.limit ?? 20,
      });
    },
  );

  app.patch<{ Params: NotificationParams; Body: { isRead: boolean } }>(
    '/notifications/:notificationId/read-state',
    {
      schema: {
        params: notificationParamsSchema,
        body: {
          type: 'object',
          required: ['isRead'],
          additionalProperties: false,
          properties: { isRead: { type: 'boolean' } },
        },
      },
    },
    async (request, reply) => {
      const userId = await currentUserId(request, options.authentication);
      const updated = await options.service.updateReadState({
        userId,
        notificationId: request.params.notificationId,
        isRead: request.body.isRead,
      });
      if (!updated) {
        return reply.code(404).send({ message: 'Notificação não encontrada.' });
      }
      return { updated: true as const };
    },
  );

  app.post('/notifications/read-all', async (request) => {
    const userId = await currentUserId(request, options.authentication);
    return { updatedCount: await options.service.markAllAsRead(userId) };
  });
}
