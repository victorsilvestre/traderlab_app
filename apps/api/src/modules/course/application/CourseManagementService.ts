import type {
  ManagedCourseDto,
  ManagedCoursePageDto,
  ManagedCourseInputDto,
  ManagedCourseStatusDto,
  ManagedCourseUpdateDto,
  CourseImageUploadRequestDto,
  ManagedCourseModuleInputDto,
  ManagedCourseModuleUpdateDto,
  ManagedCourseModulesDto,
  ReorderCourseModulesDto,
} from '@traderlab/contracts';
import type {
  CourseImageStorage,
  CourseManagementRepository,
  ManagedCourse,
  ManagedCourseModule,
  ManagedCourseModuleChanges,
  ManagedCourseModuleContext,
  PublicationState,
} from '../domain/Course.js';
import { CourseError } from '../domain/CourseError.js';

function toStatus(value: ManagedCourseStatusDto): PublicationState {
  return value === 'published' ? 'PUBLISHED' : 'DRAFT';
}

function toDto(
  course: ManagedCourse,
  coverImageUrl = course.coverImageUrl,
): ManagedCourseDto {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    coverImageUrl,
    coverImagePath: course.coverImagePath,
    status: course.status.toLowerCase() as ManagedCourseStatusDto,
    moduleCount: course.moduleCount,
    updatedAt: course.updatedAt.toISOString(),
  };
}

function toModuleDto(module: ManagedCourseModule, imageUrl = module.imageUrl) {
  return {
    id: module.id,
    courseId: module.courseId,
    title: module.title,
    description: module.description,
    imageUrl,
    imagePath: module.imagePath,
    position: module.position,
    status:
      module.status.toLowerCase() as ManagedCourseModulesDto['items'][number]['status'],
    contentCount: module.contentCount,
    contents: module.contents.map((content) => ({
      id: content.id,
      title: content.title,
      description: content.description,
      kind: content.kind.toLowerCase() as ManagedCourseModulesDto['items'][number]['contents'][number]['kind'],
      status:
        content.status.toLowerCase() as ManagedCourseModulesDto['items'][number]['contents'][number]['status'],
      position: content.position,
      materials: content.materials,
    })),
    updatedAt: module.updatedAt.toISOString(),
  };
}

function toModuleContextDto(
  context: ManagedCourseModuleContext,
  items: ManagedCourseModulesDto['items'],
): ManagedCourseModulesDto {
  return {
    course: {
      id: context.course.id,
      title: context.course.title,
      status:
        context.course.status.toLowerCase() as ManagedCourseModulesDto['course']['status'],
    },
    items,
  };
}

function normalizeText(
  value: string,
  label: string,
  maximumLength: number,
): string {
  const normalized = value.trim();
  if (!normalized) throw new CourseError(`Informe ${label}.`, 400);
  if (normalized.length > maximumLength) {
    throw new CourseError(
      `${label} deve ter até ${maximumLength} caracteres.`,
      400,
    );
  }
  return normalized;
}

export class CourseManagementService {
  constructor(
    private readonly repository: CourseManagementRepository,
    private readonly images: CourseImageStorage,
  ) {}

  private async toDto(course: ManagedCourse): Promise<ManagedCourseDto> {
    return toDto(
      course,
      course.coverImagePath
        ? await this.images.createReadUrl(course.coverImagePath)
        : course.coverImageUrl,
    );
  }

  async list(
    query: string,
    status?: ManagedCourseStatusDto,
    requestedPage = 1,
  ): Promise<ManagedCoursePageDto> {
    const normalizedQuery = query.trim().slice(0, 120);
    const pageSize = 25;
    const { items, totalItems } = await this.repository.listManaged(
      normalizedQuery,
      status ? toStatus(status) : undefined,
      (requestedPage - 1) * pageSize,
      pageSize,
    );
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const page = Math.min(requestedPage, totalPages);
    if (page !== requestedPage) {
      return this.list(query, status, page);
    }
    return {
      items: await Promise.all(items.map((course) => this.toDto(course))),
      page,
      pageSize,
      totalItems,
      totalPages,
    };
  }

  async getById(courseId: number): Promise<ManagedCourseDto> {
    const course = await this.repository.getManaged(courseId);
    if (!course) throw new CourseError('Curso não encontrado.', 404);
    return this.toDto(course);
  }

  async create(
    input: ManagedCourseInputDto,
    administratorId: string,
  ): Promise<ManagedCourseDto> {
    const course = await this.repository.createManaged({
      createdById: administratorId,
      title: normalizeText(input.title, 'o título do curso', 180),
      description: normalizeText(
        input.description,
        'a descrição do curso',
        20000,
      ),
      coverImageUrl: null,
      coverImagePath: null,
    });
    return this.toDto(course);
  }

  async update(
    courseId: number,
    input: ManagedCourseUpdateDto,
  ): Promise<ManagedCourseDto> {
    const existing = await this.repository.getManaged(courseId);
    if (!existing) throw new CourseError('Curso não encontrado.', 404);
    const changes: Parameters<CourseManagementRepository['updateManaged']>[1] =
      {};
    if (input.title !== undefined)
      changes.title = normalizeText(input.title, 'o título do curso', 180);
    if (input.description !== undefined) {
      changes.description = normalizeText(
        input.description,
        'a descrição do curso',
        20000,
      );
    }
    if (input.coverImagePath !== undefined) {
      if (
        input.coverImagePath !== null &&
        !/^courses\/\d+\/cover\/[\w-]+\.(jpg|png|webp)$/.test(
          input.coverImagePath,
        )
      ) {
        throw new CourseError('O arquivo da capa não é válido.', 400);
      }
      if (
        input.coverImagePath &&
        !input.coverImagePath.startsWith(`courses/${courseId}/cover/`)
      ) {
        throw new CourseError('A imagem precisa pertencer a este curso.', 400);
      }
      if (
        input.coverImagePath &&
        !(await this.images.exists(input.coverImagePath))
      ) {
        throw new CourseError(
          'Não foi possível localizar a imagem enviada.',
          400,
        );
      }
      changes.coverImagePath = input.coverImagePath;
    }
    if (input.status !== undefined) changes.status = toStatus(input.status);
    if (Object.keys(changes).length === 0) {
      throw new CourseError('Informe ao menos um campo para atualizar.', 400);
    }

    const course = await this.repository.updateManaged(courseId, changes);
    if (!course) throw new CourseError('Curso não encontrado.', 404);
    return this.toDto(course);
  }

  private async toModuleDto(module: ManagedCourseModule) {
    const imageUrl = module.imagePath
      ? await this.images.createReadUrl(module.imagePath)
      : module.imageUrl;
    return toModuleDto(module, imageUrl);
  }

  async listModules(courseId: number): Promise<ManagedCourseModulesDto> {
    const context = await this.repository.listManagedModules(courseId);
    if (!context) throw new CourseError('Curso não encontrado.', 404);
    const items = await Promise.all(
      context.items.map((module) => this.toModuleDto(module)),
    );
    return toModuleContextDto(context, items);
  }

  async createModule(courseId: number, input: ManagedCourseModuleInputDto) {
    if ((input.description ?? '').length > 20000) {
      throw new CourseError('A descrição deve ter até 20000 caracteres.', 400);
    }
    const managedModule = await this.repository.createManagedModule(courseId, {
      title: normalizeText(input.title, 'o título do módulo', 180),
      description: (input.description ?? '').trim(),
    });
    if (!managedModule) throw new CourseError('Curso não encontrado.', 404);
    return this.toModuleDto(managedModule);
  }

  async updateModule(
    courseId: number,
    moduleId: number,
    input: ManagedCourseModuleUpdateDto,
  ) {
    const context = await this.repository.listManagedModules(courseId);
    if (!context) throw new CourseError('Curso não encontrado.', 404);
    if (!context.items.some((module) => module.id === moduleId)) {
      throw new CourseError('Módulo não encontrado neste curso.', 404);
    }

    const changes: ManagedCourseModuleChanges = {};
    if (input.title !== undefined) {
      changes.title = normalizeText(input.title, 'o título do módulo', 180);
    }
    if (input.description !== undefined) {
      if (input.description.length > 20000) {
        throw new CourseError(
          'A descrição deve ter até 20000 caracteres.',
          400,
        );
      }
      changes.description = input.description.trim();
    }
    if (input.imagePath !== undefined) {
      if (
        input.imagePath !== null &&
        !/^modules\/\d+\/cover\/[\w-]+\.(jpg|png|webp)$/.test(input.imagePath)
      ) {
        throw new CourseError(
          'O arquivo de capa não é válido para este módulo.',
          400,
        );
      }
      if (
        input.imagePath &&
        !input.imagePath.startsWith(`modules/${moduleId}/cover/`)
      ) {
        throw new CourseError('A imagem precisa pertencer a este módulo.', 400);
      }
      if (input.imagePath && !(await this.images.exists(input.imagePath))) {
        throw new CourseError(
          'Não foi possível localizar a imagem enviada.',
          400,
        );
      }
      changes.imagePath = input.imagePath;
    }
    if (input.status !== undefined) changes.status = toStatus(input.status);
    if (Object.keys(changes).length === 0) {
      throw new CourseError('Informe ao menos um campo para atualizar.', 400);
    }

    const managedModule = await this.repository.updateManagedModule(
      courseId,
      moduleId,
      changes,
    );
    if (!managedModule)
      throw new CourseError('Módulo não encontrado neste curso.', 404);
    return this.toModuleDto(managedModule);
  }

  async reorderModules(
    courseId: number,
    input: ReorderCourseModulesDto,
  ): Promise<void> {
    const context = await this.repository.listManagedModules(courseId);
    if (!context) throw new CourseError('Curso não encontrado.', 404);
    const orderedIds = input.orderedIds;
    const ids = new Set(orderedIds);
    const currentIds = new Set(context.items.map((module) => module.id));
    if (
      ids.size !== orderedIds.length ||
      orderedIds.length !== context.items.length ||
      orderedIds.some(
        (id) => !Number.isSafeInteger(id) || id < 1 || !currentIds.has(id),
      )
    ) {
      throw new CourseError(
        'A ordem precisa incluir cada módulo deste curso uma única vez.',
        400,
      );
    }

    const updated = await this.repository.reorderManagedModules(
      courseId,
      orderedIds,
    );
    if (!updated) {
      throw new CourseError(
        'A lista de módulos mudou. Atualize a página e tente novamente.',
        409,
      );
    }
  }

  async createImageUpload(
    input: CourseImageUploadRequestDto,
  ): Promise<{ path: string; token: string }> {
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    const maximumBytes = 5 * 1024 * 1024;
    const extensionByType: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    if (!allowedTypes.has(input.contentType))
      throw new CourseError('Use uma imagem JPEG, PNG ou WebP.', 400);
    if (
      !Number.isSafeInteger(input.sizeBytes) ||
      input.sizeBytes < 1 ||
      input.sizeBytes > maximumBytes
    ) {
      throw new CourseError('A imagem deve ter até 5 MB.', 400);
    }
    if (
      !Number.isSafeInteger(input.id) ||
      input.id < 1 ||
      !(await this.repository.imageTargetExists(input.kind, input.id))
    ) {
      throw new CourseError('O destino da imagem não foi encontrado.', 404);
    }
    const folder =
      input.kind === 'course'
        ? `courses/${input.id}/cover`
        : input.kind === 'module'
          ? `modules/${input.id}/cover`
          : `contents/${input.id}/cover`;
    const path = `${folder}/${crypto.randomUUID()}.${extensionByType[input.contentType]}`;
    const { token } = await this.images.createUpload(path);
    return { path, token };
  }
}
