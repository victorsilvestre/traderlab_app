import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AdminEnrollmentInputDto } from '@traderlab/contracts';
import type { AuthenticationService } from '../../authentication/application/AuthenticationService.js';
import { AuthenticationError } from '../../authentication/domain/AuthenticationError.js';
import type { EnrollmentService } from '../application/EnrollmentService.js';

type EnrollmentQuery = {
  query?: string;
  courseId?: number;
  status?: 'active' | 'revoked';
  page?: number;
};
type OptionsQuery = { query?: string; userId?: string };

function accessToken(request: FastifyRequest): string {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AuthenticationError('Entre novamente para continuar.', 401);
  }
  return header.slice('Bearer '.length);
}

export async function enrollmentRoutes(
  app: FastifyInstance,
  options: { authentication: AuthenticationService; service: EnrollmentService },
): Promise<void> {
  app.get<{ Querystring: EnrollmentQuery }>(
    '/admin/enrollments',
    {
      schema: { querystring: {
        type: 'object', additionalProperties: false,
        properties: {
          query: { type: 'string', maxLength: 120 },
          courseId: { type: 'integer', minimum: 1 },
          status: { type: 'string', enum: ['active', 'revoked'] },
          page: { type: 'integer', minimum: 1, maximum: 10000 },
        },
      } },
    },
    async (request) => {
      await options.authentication.getCurrentAdministrator(accessToken(request));
      return options.service.list(request.query);
    },
  );

  app.get<{ Querystring: OptionsQuery }>(
    '/admin/enrollments/options',
    {
      schema: { querystring: {
        type: 'object', additionalProperties: false,
        properties: {
          query: { type: 'string', maxLength: 120 },
          userId: { type: 'string', format: 'uuid' },
        },
      } },
    },
    async (request) => {
      await options.authentication.getCurrentAdministrator(accessToken(request));
      return options.service.options(request.query.query, request.query.userId ?? null);
    },
  );

  app.post<{ Body: AdminEnrollmentInputDto }>(
    '/admin/enrollments',
    {
      schema: { body: {
        type: 'object', required: ['userId', 'courseId'], additionalProperties: false,
        properties: {
          userId: { type: 'string', format: 'uuid' },
          courseId: { type: 'integer', minimum: 1 },
        },
      } },
    },
    async (request, reply) => {
      await options.authentication.getCurrentAdministrator(accessToken(request));
      const enrollment = await options.service.create(request.body);
      return reply.code(201).send(enrollment);
    },
  );
}
