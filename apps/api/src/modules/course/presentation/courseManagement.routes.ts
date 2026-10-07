import type { FastifyInstance, FastifyRequest } from 'fastify';
import type {
  ManagedCourseInputDto,
  ManagedCourseStatusDto,
  ManagedCourseUpdateDto,
  ManagedCourseModuleInputDto,
  ManagedCourseModuleUpdateDto,
  ReorderCourseModulesDto,
  CourseImageUploadRequestDto,
} from '@traderlab/contracts';
import type { AuthenticationService } from '../../authentication/application/AuthenticationService.js';
import { AuthenticationError } from '../../authentication/domain/AuthenticationError.js';
import type { CourseManagementService } from '../application/CourseManagementService.js';

type CourseParams = { courseId: number };
type ModuleParams = CourseParams & { moduleId: number };
type CourseQuery = { query?: string; status?: ManagedCourseStatusDto; page?: number };
type ImageUploadBody = CourseImageUploadRequestDto;

function accessToken(request: FastifyRequest): string {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AuthenticationError('Entre novamente para continuar.', 401);
  }
  return header.slice('Bearer '.length);
}

const courseParamsSchema = {
  type: 'object',
  required: ['courseId'],
  additionalProperties: false,
  properties: { courseId: { type: 'integer', minimum: 1 } },
} as const;

const moduleParamsSchema = {
  type: 'object',
  required: ['courseId', 'moduleId'],
  additionalProperties: false,
  properties: {
    courseId: { type: 'integer', minimum: 1 },
    moduleId: { type: 'integer', minimum: 1 },
  },
} as const;

const createBodySchema = {
  type: 'object',
  required: ['title', 'description'],
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 180 },
    description: { type: 'string', minLength: 1, maxLength: 20000 },
  },
} as const;

const updateBodySchema = {
  type: 'object',
  minProperties: 1,
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 180 },
    description: { type: 'string', minLength: 1, maxLength: 20000 },
    coverImagePath: { anyOf: [{ type: 'string', maxLength: 512 }, { type: 'null' }] },
    status: { type: 'string', enum: ['draft', 'published'] },
  },
} as const;

const createModuleBodySchema = {
  type: 'object',
  required: ['title'],
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 180 },
    description: { type: 'string', maxLength: 20000 },
  },
} as const;

const updateModuleBodySchema = {
  type: 'object',
  minProperties: 1,
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 180 },
    description: { type: 'string', maxLength: 20000 },
    imagePath: { anyOf: [{ type: 'string', maxLength: 512 }, { type: 'null' }] },
    status: { type: 'string', enum: ['draft', 'published'] },
  },
} as const;

const reorderModulesBodySchema = {
  type: 'object',
  required: ['orderedIds'],
  additionalProperties: false,
  properties: {
    orderedIds: {
      type: 'array',
      uniqueItems: true,
      items: { type: 'integer', minimum: 1 },
    },
  },
} as const;

export async function courseManagementRoutes(
  app: FastifyInstance,
  options: {
    authentication: AuthenticationService;
    service: CourseManagementService;
  },
): Promise<void> {
  app.get<{ Querystring: CourseQuery }>(
    '/admin/courses',
    {
      schema: {
        querystring: {
          type: 'object',
          additionalProperties: false,
          properties: {
            query: { type: 'string', maxLength: 120 },
            status: { type: 'string', enum: ['draft', 'published'] },
            page: { type: 'integer', minimum: 1, maximum: 100000 },
          },
        },
      },
    },
    async (request) => {
      await options.authentication.getCurrentAdministrator(accessToken(request));
      return options.service.list(request.query.query ?? '', request.query.status, request.query.page ?? 1);
    },
  );

  app.post<{ Body: ImageUploadBody }>(
    '/admin/course-images/upload-url',
    {
      schema: {
        body: {
          type: 'object', required: ['kind', 'id', 'contentType', 'sizeBytes'], additionalProperties: false,
          properties: {
            kind: { type: 'string', enum: ['course', 'module', 'content'] },
            id: { type: 'integer', minimum: 1 },
            contentType: { type: 'string', maxLength: 100 },
            sizeBytes: { type: 'integer', minimum: 1, maximum: 5242880 },
          },
        },
      },
    },
    async (request) => {
      await options.authentication.getCurrentAdministrator(accessToken(request));
      return options.service.createImageUpload(request.body);
    },
  );

  app.post<{ Body: ManagedCourseInputDto }>(
    '/admin/courses',
    { schema: { body: createBodySchema } },
    async (request, reply) => {
      const administrator = await options.authentication.getCurrentAdministrator(
        accessToken(request),
      );
      const course = await options.service.create(request.body, administrator.id);
      return reply.code(201).send(course);
    },
  );

  app.get<{ Params: CourseParams }>(
    '/admin/courses/:courseId',
    { schema: { params: courseParamsSchema } },
    async (request) => {
      await options.authentication.getCurrentAdministrator(accessToken(request));
      return options.service.getById(request.params.courseId);
    },
  );

  app.patch<{ Params: CourseParams; Body: ManagedCourseUpdateDto }>(
    '/admin/courses/:courseId',
    { schema: { params: courseParamsSchema, body: updateBodySchema } },
    async (request) => {
      await options.authentication.getCurrentAdministrator(accessToken(request));
      return options.service.update(request.params.courseId, request.body);
    },
  );

  app.get<{ Params: CourseParams }>(
    '/admin/courses/:courseId/modules',
    { schema: { params: courseParamsSchema } },
    async (request) => {
      await options.authentication.getCurrentAdministrator(accessToken(request));
      return options.service.listModules(request.params.courseId);
    },
  );

  app.post<{ Params: CourseParams; Body: ManagedCourseModuleInputDto }>(
    '/admin/courses/:courseId/modules',
    { schema: { params: courseParamsSchema, body: createModuleBodySchema } },
    async (request, reply) => {
      await options.authentication.getCurrentAdministrator(accessToken(request));
      const managedModule = await options.service.createModule(request.params.courseId, request.body);
      return reply.code(201).send(managedModule);
    },
  );

  app.patch<{ Params: CourseParams; Body: ReorderCourseModulesDto }>(
    '/admin/courses/:courseId/modules/order',
    { schema: { params: courseParamsSchema, body: reorderModulesBodySchema } },
    async (request) => {
      await options.authentication.getCurrentAdministrator(accessToken(request));
      await options.service.reorderModules(request.params.courseId, request.body);
      return { message: 'Ordem dos módulos atualizada.' };
    },
  );

  app.patch<{ Params: ModuleParams; Body: ManagedCourseModuleUpdateDto }>(
    '/admin/courses/:courseId/modules/:moduleId',
    { schema: { params: moduleParamsSchema, body: updateModuleBodySchema } },
    async (request) => {
      await options.authentication.getCurrentAdministrator(accessToken(request));
      return options.service.updateModule(
        request.params.courseId,
        request.params.moduleId,
        request.body,
      );
    },
  );
}
