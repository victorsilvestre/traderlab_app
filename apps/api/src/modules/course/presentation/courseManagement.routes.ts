import type { FastifyInstance, FastifyRequest } from 'fastify';
import type {
  ManagedCourseInputDto,
  ManagedCourseStatusDto,
  ManagedCourseUpdateDto,
  ManagedCourseModuleInputDto,
  ManagedCourseModuleUpdateDto,
  ReorderCourseModulesDto,
  CourseImageUploadRequestDto,
  ManagedLessonInputDto,
  ManagedLessonUpdateDto,
  CourseMaterialUploadRequestDto,
} from '@traderlab/contracts';
import type { AuthenticationService } from '../../authentication/application/AuthenticationService.js';
import { AuthenticationError } from '../../authentication/domain/AuthenticationError.js';
import type { CourseManagementService } from '../application/CourseManagementService.js';

type CourseParams = { courseId: number };
type ModuleParams = CourseParams & { moduleId: number };
type LessonParams = ModuleParams & { contentId: number };
type CourseQuery = {
  query?: string;
  status?: ManagedCourseStatusDto;
  page?: number;
};
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
    coverImagePath: {
      anyOf: [{ type: 'string', maxLength: 512 }, { type: 'null' }],
    },
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
    imagePath: {
      anyOf: [{ type: 'string', maxLength: 512 }, { type: 'null' }],
    },
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

const lessonParamsSchema = {
  type: 'object',
  required: ['courseId', 'moduleId', 'contentId'],
  additionalProperties: false,
  properties: {
    courseId: { type: 'integer', minimum: 1 },
    moduleId: { type: 'integer', minimum: 1 },
    contentId: { type: 'integer', minimum: 1 },
  },
} as const;
const lessonInputSchema = {
  type: 'object',
  required: ['title'],
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 180 },
    description: { type: 'string', maxLength: 20000 },
    body: { type: 'string', maxLength: 100000 },
    videoUrl: {
      anyOf: [{ type: 'string', maxLength: 2048 }, { type: 'null' }],
    },
  },
} as const;
const lessonUpdateSchema = {
  type: 'object',
  minProperties: 1,
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 180 },
    description: { type: 'string', maxLength: 20000 },
    body: { type: 'string', maxLength: 100000 },
    videoUrl: {
      anyOf: [{ type: 'string', maxLength: 2048 }, { type: 'null' }],
    },
    imagePath: {
      anyOf: [{ type: 'string', maxLength: 512 }, { type: 'null' }],
    },
    status: { type: 'string', enum: ['draft', 'published'] },
    materials: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'description', 'mimeType', 'sizeBytes', 'position'],
        additionalProperties: false,
        properties: {
          id: { type: 'integer', minimum: 1 },
          name: { type: 'string', minLength: 1, maxLength: 240 },
          description: { type: 'string', maxLength: 500 },
          mimeType: { type: 'string', maxLength: 160 },
          sizeBytes: { type: 'integer', minimum: 1 },
          uploadPath: { type: 'string', maxLength: 1024 },
          position: { type: 'integer', minimum: 0 },
        },
      },
    },
  },
} as const;
const materialUploadSchema = {
  type: 'object',
  required: ['courseId', 'moduleId', 'contentId', 'contentType', 'sizeBytes'],
  additionalProperties: false,
  properties: {
    courseId: { type: 'integer', minimum: 1 },
    moduleId: { type: 'integer', minimum: 1 },
    contentId: { type: 'integer', minimum: 1 },
    contentType: { type: 'string', maxLength: 160 },
    sizeBytes: { type: 'integer', minimum: 1, maximum: 52428800 },
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
      await options.authentication.getCurrentAdministrator(
        accessToken(request),
      );
      return options.service.list(
        request.query.query ?? '',
        request.query.status,
        request.query.page ?? 1,
      );
    },
  );

  app.post<{ Body: ImageUploadBody }>(
    '/admin/course-images/upload-url',
    {
      schema: {
        body: {
          type: 'object',
          required: ['kind', 'id', 'contentType', 'sizeBytes'],
          additionalProperties: false,
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
      await options.authentication.getCurrentAdministrator(
        accessToken(request),
      );
      return options.service.createImageUpload(request.body);
    },
  );

  app.post<{ Body: ManagedCourseInputDto }>(
    '/admin/courses',
    { schema: { body: createBodySchema } },
    async (request, reply) => {
      const administrator =
        await options.authentication.getCurrentAdministrator(
          accessToken(request),
        );
      const course = await options.service.create(
        request.body,
        administrator.id,
      );
      return reply.code(201).send(course);
    },
  );

  app.get<{ Params: CourseParams }>(
    '/admin/courses/:courseId',
    { schema: { params: courseParamsSchema } },
    async (request) => {
      await options.authentication.getCurrentAdministrator(
        accessToken(request),
      );
      return options.service.getById(request.params.courseId);
    },
  );

  app.patch<{ Params: CourseParams; Body: ManagedCourseUpdateDto }>(
    '/admin/courses/:courseId',
    { schema: { params: courseParamsSchema, body: updateBodySchema } },
    async (request) => {
      await options.authentication.getCurrentAdministrator(
        accessToken(request),
      );
      return options.service.update(request.params.courseId, request.body);
    },
  );

  app.get<{ Params: CourseParams }>(
    '/admin/courses/:courseId/modules',
    { schema: { params: courseParamsSchema } },
    async (request) => {
      await options.authentication.getCurrentAdministrator(
        accessToken(request),
      );
      return options.service.listModules(request.params.courseId);
    },
  );

  app.post<{ Params: CourseParams; Body: ManagedCourseModuleInputDto }>(
    '/admin/courses/:courseId/modules',
    { schema: { params: courseParamsSchema, body: createModuleBodySchema } },
    async (request, reply) => {
      await options.authentication.getCurrentAdministrator(
        accessToken(request),
      );
      const managedModule = await options.service.createModule(
        request.params.courseId,
        request.body,
      );
      return reply.code(201).send(managedModule);
    },
  );

  app.patch<{ Params: CourseParams; Body: ReorderCourseModulesDto }>(
    '/admin/courses/:courseId/modules/order',
    { schema: { params: courseParamsSchema, body: reorderModulesBodySchema } },
    async (request) => {
      await options.authentication.getCurrentAdministrator(
        accessToken(request),
      );
      await options.service.reorderModules(
        request.params.courseId,
        request.body,
      );
      return { message: 'Ordem dos módulos atualizada.' };
    },
  );

  app.patch<{ Params: ModuleParams; Body: ManagedCourseModuleUpdateDto }>(
    '/admin/courses/:courseId/modules/:moduleId',
    { schema: { params: moduleParamsSchema, body: updateModuleBodySchema } },
    async (request) => {
      await options.authentication.getCurrentAdministrator(
        accessToken(request),
      );
      return options.service.updateModule(
        request.params.courseId,
        request.params.moduleId,
        request.body,
      );
    },
  );

  app.post<{ Params: ModuleParams; Body: ManagedLessonInputDto }>(
    '/admin/courses/:courseId/modules/:moduleId/lessons',
    { schema: { params: moduleParamsSchema, body: lessonInputSchema } },
    async (request, reply) => {
      await options.authentication.getCurrentAdministrator(
        accessToken(request),
      );
      const lesson = await options.service.createLesson(
        request.params.courseId,
        request.params.moduleId,
        request.body,
      );
      return reply.code(201).send(lesson);
    },
  );

  app.get<{ Params: LessonParams }>(
    '/admin/courses/:courseId/modules/:moduleId/lessons/:contentId',
    { schema: { params: lessonParamsSchema } },
    async (request) => {
      await options.authentication.getCurrentAdministrator(
        accessToken(request),
      );
      return options.service.getLesson(
        request.params.courseId,
        request.params.moduleId,
        request.params.contentId,
      );
    },
  );

  app.patch<{ Params: LessonParams; Body: ManagedLessonUpdateDto }>(
    '/admin/courses/:courseId/modules/:moduleId/lessons/:contentId',
    { schema: { params: lessonParamsSchema, body: lessonUpdateSchema } },
    async (request) => {
      await options.authentication.getCurrentAdministrator(
        accessToken(request),
      );
      return options.service.updateLesson(
        request.params.courseId,
        request.params.moduleId,
        request.params.contentId,
        request.body,
      );
    },
  );

  app.patch<{ Params: ModuleParams; Body: ReorderCourseModulesDto }>(
    '/admin/courses/:courseId/modules/:moduleId/lessons/order',
    { schema: { params: moduleParamsSchema, body: reorderModulesBodySchema } },
    async (request) => {
      await options.authentication.getCurrentAdministrator(
        accessToken(request),
      );
      await options.service.reorderLessons(
        request.params.courseId,
        request.params.moduleId,
        request.body,
      );
      return { message: 'Ordem das aulas atualizada.' };
    },
  );

  app.post<{ Body: CourseMaterialUploadRequestDto }>(
    '/admin/course-materials/upload-url',
    { schema: { body: materialUploadSchema } },
    async (request) => {
      await options.authentication.getCurrentAdministrator(
        accessToken(request),
      );
      return options.service.createMaterialUpload(request.body);
    },
  );
}
