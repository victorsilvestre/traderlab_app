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
  ManagedLessonInputDto,
  ManagedLessonUpdateDto,
  ManagedLessonDto,
  CourseMaterialUploadRequestDto,
} from '@traderlab/contracts';
import type {
  CourseImageStorage,
  CourseManagementRepository,
  ManagedCourse,
  ManagedCourseModule,
  ManagedCourseModuleChanges,
  ManagedCourseModuleContext,
  PublicationState,
  ManagedLessonChanges,
  ManagedLessonRecord,
  CourseMaterialStorage,
} from '../domain/Course.js';
import { CourseError } from '../domain/CourseError.js';
import { toRichTextDocument } from './RichTextDocument.js';

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
      imageUrl: content.imageUrl,
      imagePath: content.imagePath,
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
    private readonly materials: CourseMaterialStorage,
  ) {}

  private async toLessonDto(
    lesson: ManagedLessonRecord,
  ): Promise<ManagedLessonDto> {
    return {
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      description: lesson.description,
      body: lesson.body,
      videoUrl: lesson.videoUrl,
      imageUrl: lesson.imagePath
        ? await this.images.createReadUrl(lesson.imagePath)
        : null,
      imagePath: lesson.imagePath,
      status: (
        lesson.status ?? 'DRAFT'
      ).toLowerCase() as ManagedLessonDto['status'],
      position: lesson.position,
      materials: lesson.materials.map(
        ({ id, name, description, mimeType, sizeBytes, position }) => ({
          id,
          name,
          description,
          mimeType,
          sizeBytes,
          position,
        }),
      ),
    };
  }

  private normalizeLessonInput(
    input: ManagedLessonInputDto | ManagedLessonUpdateDto,
  ): ManagedLessonChanges {
    const title = normalizeText(input.title ?? '', 'o título da aula', 180);
    const description = (input.description ?? '').trim();
    const body = input.body ?? '';
    if (description.length > 20000)
      throw new CourseError('A descrição deve ter até 20000 caracteres.', 400);
    if (body.length > 100000)
      throw new CourseError(
        'O conteúdo da aula deve ter até 100000 caracteres.',
        400,
      );
    const videoUrl = (input.videoUrl ?? '').trim() || null;
    if (videoUrl) {
      let url: URL;
      try {
        url = new URL(videoUrl);
      } catch {
        throw new CourseError('Informe uma URL válida do YouTube.', 400);
      }
      if (
        url.protocol !== 'https:' ||
        ![
          'youtube.com',
          'www.youtube.com',
          'm.youtube.com',
          'youtu.be',
          'www.youtube-nocookie.com',
        ].includes(url.hostname)
      ) {
        throw new CourseError('Use uma URL segura do YouTube.', 400);
      }
    }
    const richBody = JSON.stringify(toRichTextDocument(body));
    const materials = (input.materials ?? []).map((material, index) => {
      const name = normalizeText(material.name, 'o nome do material', 240);
      const description = (material.description ?? '').trim();
      if (description.length > 500)
        throw new CourseError(
          'A descrição do material deve ter até 500 caracteres.',
          400,
        );
      if (!Number.isSafeInteger(material.sizeBytes) || material.sizeBytes < 1) {
        throw new CourseError(
          'Confira o tamanho informado para o material.',
          400,
        );
      }
      if (!material.id && material.sizeBytes > 50 * 1024 * 1024) {
        throw new CourseError('Cada novo material deve ter até 50 MB.', 400);
      }
      if (material.position !== index)
        throw new CourseError('A ordem dos materiais está inválida.', 400);
      return {
        ...(material.id ? { id: material.id } : {}),
        name,
        description,
        mimeType:
          material.mimeType?.slice(0, 160) || 'application/octet-stream',
        sizeBytes: material.sizeBytes,
        ...(material.uploadPath ? { storagePath: material.uploadPath } : {}),
        position: index,
      };
    });
    return {
      title,
      description,
      body: richBody,
      videoUrl,
      imagePath: 'imagePath' in input ? input.imagePath ?? null : null,
      materials,
    };
  }

  async createLesson(
    courseId: number,
    moduleId: number,
    input: ManagedLessonInputDto,
  ) {
    const context = await this.repository.listManagedModules(courseId);
    if (!context) throw new CourseError('Curso não encontrado.', 404);
    if (!context.items.some((module) => module.id === moduleId))
      throw new CourseError('Módulo não encontrado neste curso.', 404);
    const normalized = this.normalizeLessonInput(input);
    if (normalized.materials.length)
      throw new CourseError('Salve a aula antes de anexar arquivos.', 400);
    const lesson = await this.repository.createManagedLesson(
      moduleId,
      normalized,
    );
    return this.toLessonDto(lesson);
  }

  async updateLesson(
    courseId: number,
    moduleId: number,
    contentId: number,
    input: ManagedLessonUpdateDto,
  ) {
    const existing = await this.repository.getManagedLesson(
      courseId,
      moduleId,
      contentId,
    );
    if (
      !existing ||
      existing.moduleId !== moduleId ||
      !(await this.repository.lessonExists(courseId, moduleId, contentId))
    )
      throw new CourseError('Aula não encontrada neste módulo.', 404);
    const merged: ManagedLessonUpdateDto = {
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      body: input.body ?? existing.body,
      videoUrl:
        input.videoUrl === undefined ? existing.videoUrl : input.videoUrl,
      imagePath:
        input.imagePath === undefined ? existing.imagePath : input.imagePath,
      materials:
        input.materials ??
        existing.materials.map(
          ({ id, name, description, mimeType, sizeBytes, position }) => ({
            id,
            name,
            description,
            mimeType,
            sizeBytes,
            position,
          }),
        ),
      ...(input.status ? { status: input.status } : {}),
    };
    const changes = this.normalizeLessonInput(merged);
    if (input.imagePath !== undefined && changes.imagePath !== null) {
      if (
        !new RegExp(`^contents/${contentId}/cover/[\\w-]+\\.(jpg|png|webp)$`).test(
          changes.imagePath,
        ) ||
        !(await this.images.exists(changes.imagePath))
      ) {
        throw new CourseError(
          'Não foi possível localizar a imagem de capa enviada para esta aula.',
          400,
        );
      }
    }
    if (input.status !== undefined) changes.status = toStatus(input.status);
    if (changes.status === 'PUBLISHED' && !changes.imagePath) {
      throw new CourseError(
        'Envie uma imagem de capa antes de publicar esta aula.',
        400,
      );
    }
    for (const material of changes.materials) {
      const expectedPath = new RegExp(
        `^contents/${contentId}/materials/[0-9a-f-]{36}$`,
      );
      if (material.id === undefined) {
        if (
          !material.storagePath ||
          !expectedPath.test(material.storagePath) ||
          !(await this.materials.exists(material.storagePath))
        ) {
          throw new CourseError(
            'Não foi possível localizar o arquivo enviado para esta aula.',
            400,
          );
        }
      } else if (material.storagePath !== undefined) {
        throw new CourseError(
          'O caminho do arquivo não pode ser alterado diretamente.',
          400,
        );
      } else {
        const previous = existing.materials.find(
          (item) => item.id === material.id,
        );
        if (!previous)
          throw new CourseError('Material não pertence a esta aula.', 400);
        material.storagePath = previous.storagePath;
      }
    }
    const lesson = await this.repository.updateManagedLesson(
      courseId,
      moduleId,
      contentId,
      changes,
    );
    if (!lesson)
      throw new CourseError(
        'Aula ou material não encontrado nesta estrutura.',
        404,
      );
    return this.toLessonDto(lesson);
  }

  async getLesson(courseId: number, moduleId: number, contentId: number) {
    const lesson = await this.repository.getManagedLesson(
      courseId,
      moduleId,
      contentId,
    );
    if (!lesson)
      throw new CourseError('Aula não encontrada neste módulo.', 404);
    return this.toLessonDto(lesson);
  }

  async reorderLessons(
    courseId: number,
    moduleId: number,
    input: ReorderCourseModulesDto,
  ) {
    const context = await this.repository.listManagedModules(courseId);
    const courseModule = context?.items.find((item) => item.id === moduleId);
    if (!courseModule)
      throw new CourseError('Módulo não encontrado neste curso.', 404);
    const lessonIds = courseModule.contents
      .filter((content) => content.kind === 'LESSON')
      .map((content) => content.id);
    if (
      input.orderedIds.length !== lessonIds.length ||
      new Set(input.orderedIds).size !== input.orderedIds.length ||
      input.orderedIds.some((id) => !lessonIds.includes(id))
    ) {
      throw new CourseError(
        'A ordem precisa incluir cada aula deste módulo uma única vez.',
        400,
      );
    }
    if (
      !(await this.repository.reorderManagedLessons(moduleId, input.orderedIds))
    )
      throw new CourseError(
        'A lista de aulas mudou. Atualize a página e tente novamente.',
        409,
      );
  }

  async createMaterialUpload(input: CourseMaterialUploadRequestDto) {
    if (
      !Number.isSafeInteger(input.sizeBytes) ||
      input.sizeBytes < 1 ||
      input.sizeBytes > 50 * 1024 * 1024
    ) {
      throw new CourseError('Cada material deve ter até 50 MB.', 400);
    }
    if (
      !(await this.repository.lessonExists(
        input.courseId,
        input.moduleId,
        input.contentId,
      ))
    ) {
      throw new CourseError('Aula não encontrada nesta estrutura.', 404);
    }
    const path = `contents/${input.contentId}/materials/${crypto.randomUUID()}`;
    const { token } = await this.materials.createUpload(path);
    return { path, token };
  }

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
    const dto = toModuleDto(module, imageUrl);
    return {
      ...dto,
      contents: await Promise.all(
        module.contents.map(async (content) => ({
          ...dto.contents.find((item) => item.id === content.id)!,
          imageUrl: content.imagePath
            ? await this.images.createReadUrl(content.imagePath)
            : null,
          imagePath: content.imagePath,
        })),
      ),
    };
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
