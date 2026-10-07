import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AuthenticationService } from '../../authentication/application/AuthenticationService.js';
import { AuthenticationError } from '../../authentication/domain/AuthenticationError.js';
import type { CourseService } from '../application/CourseService.js';

type CourseParams = { courseId: number };
type ContentParams = { courseId: number; contentId: number };
type MaterialParams = ContentParams & { materialId: number };
type SearchQuery = { query?: string };
type StudentSearchQuery = { query?: string };

function accessToken(request: FastifyRequest): string {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AuthenticationError('Entre novamente para continuar.', 401);
  }
  return header.slice('Bearer '.length);
}

async function requireLearner(
  request: FastifyRequest,
  authentication: AuthenticationService,
): Promise<string> {
  const profile = await authentication.getCurrentUser(accessToken(request));
  return profile.id;
}

const courseParamsSchema = {
  type: 'object',
  required: ['courseId'],
  additionalProperties: false,
  properties: { courseId: { type: 'integer', minimum: 1 } },
} as const;

const contentParamsSchema = {
  type: 'object',
  required: ['courseId', 'contentId'],
  additionalProperties: false,
  properties: {
    courseId: { type: 'integer', minimum: 1 },
    contentId: { type: 'integer', minimum: 1 },
  },
} as const;

const materialParamsSchema = {
  type: 'object',
  required: ['courseId', 'contentId', 'materialId'],
  additionalProperties: false,
  properties: {
    courseId: { type: 'integer', minimum: 1 },
    contentId: { type: 'integer', minimum: 1 },
    materialId: { type: 'integer', minimum: 1 },
  },
} as const;

export async function courseRoutes(
  app: FastifyInstance,
  options: {
    authentication: AuthenticationService;
    service: CourseService;
  },
): Promise<void> {
  app.get('/courses', async (request) => {
    const studentId = await requireLearner(request, options.authentication);
    return options.service.listForStudent(studentId);
  });

  app.get<{ Querystring: StudentSearchQuery }>(
    '/courses/search',
    {
      schema: {
        querystring: {
          type: 'object',
          additionalProperties: false,
          properties: { query: { type: 'string', maxLength: 120 } },
        },
      },
    },
    async (request) => {
      const studentId = await requireLearner(request, options.authentication);
      return options.service.searchAccessibleCatalog(
        studentId,
        request.query.query ?? '',
      );
    },
  );

  app.get<{ Params: CourseParams }>(
    '/courses/:courseId',
    { schema: { params: courseParamsSchema } },
    async (request) => {
      const studentId = await requireLearner(request, options.authentication);
      return options.service.getCourse(studentId, request.params.courseId);
    },
  );

  app.get<{ Params: CourseParams; Querystring: SearchQuery }>(
    '/courses/:courseId/search',
    {
      schema: {
        params: courseParamsSchema,
        querystring: {
          type: 'object',
          additionalProperties: false,
          properties: { query: { type: 'string', maxLength: 120 } },
        },
      },
    },
    async (request) => {
      const studentId = await requireLearner(request, options.authentication);
      return options.service.searchCourse(
        studentId,
        request.params.courseId,
        request.query.query ?? '',
      );
    },
  );

  app.post<{ Params: ContentParams }>(
    '/courses/:courseId/contents/:contentId/open',
    { schema: { params: contentParamsSchema } },
    async (request) => {
      const studentId = await requireLearner(request, options.authentication);
      return options.service.openContent(
        studentId,
        request.params.courseId,
        request.params.contentId,
      );
    },
  );

  app.post<{ Params: ContentParams }>(
    '/courses/:courseId/contents/:contentId/completion',
    { schema: { params: contentParamsSchema } },
    async (request) => {
      const studentId = await requireLearner(request, options.authentication);
      return options.service.completeContent(
        studentId,
        request.params.courseId,
        request.params.contentId,
      );
    },
  );

  app.get<{ Params: MaterialParams }>(
    '/courses/:courseId/contents/:contentId/materials/:materialId/download',
    { schema: { params: materialParamsSchema } },
    async (request, reply) => {
      const studentId = await requireLearner(request, options.authentication);
      const material = await options.service.downloadMaterial(
        studentId,
        request.params.courseId,
        request.params.contentId,
        request.params.materialId,
      );
      return reply
        .header('cache-control', 'private, no-store')
        .header('content-type', material.mimeType)
        .header('content-length', String(material.bytes.byteLength))
        .header(
          'content-disposition',
          `attachment; filename*=UTF-8''${encodeURIComponent(material.name)}`,
        )
        .header('x-content-type-options', 'nosniff')
        .send(Buffer.from(material.bytes));
    },
  );
}
