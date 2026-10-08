import { PublicationStatus } from '../../../generated/prisma/client.js';
import { prisma } from '../../../database/prisma.js';
import type {
  CourseManagementRepository,
  CourseImageTarget,
  ManagedCourse,
  ManagedCourseModule,
  ManagedCourseModuleChanges,
  ManagedCourseModuleContext,
  ManagedCourseChanges,
  NewManagedCourse,
  NewManagedCourseModule,
  PublicationState,
  ManagedLessonChanges,
  ManagedLessonRecord,
} from '../domain/Course.js';

function toPublicationStatus(status: PublicationState): PublicationStatus {
  return status === 'PUBLISHED'
    ? PublicationStatus.PUBLISHED
    : PublicationStatus.DRAFT;
}

function mapModule(module: {
  id: number;
  courseId: number;
  title: string;
  description: string;
  imageUrl: string | null;
  imagePath: string | null;
  position: number;
  status: PublicationStatus;
  updatedAt: Date;
  _count: { contents: number };
  contents?: Array<{
    id: number;
    title: string;
    description: string;
    imagePath: string | null;
    kind: 'LESSON' | 'MATERIAL';
    status: PublicationStatus;
    position: number;
    materials: Array<{
      id: number;
      name: string;
      description: string;
      mimeType: string;
      sizeBytes: number;
      position: number;
    }>;
  }>;
}): ManagedCourseModule {
  return {
    id: module.id,
    courseId: module.courseId,
    title: module.title,
    description: module.description,
    imageUrl: module.imageUrl,
    imagePath: module.imagePath,
    position: module.position,
    status: module.status,
    contentCount: module._count.contents,
    contents: (module.contents ?? []).map((content) => ({
      ...content,
      imageUrl: null,
      materials: content.materials,
    })),
    updatedAt: module.updatedAt,
  };
}

function mapCourse(course: {
  id: number;
  title: string;
  description: string;
  coverImageUrl: string | null;
  coverImagePath: string | null;
  status: PublicationStatus;
  updatedAt: Date;
  _count: { modules: number };
}): ManagedCourse {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    coverImageUrl: course.coverImageUrl,
    coverImagePath: course.coverImagePath,
    status: course.status,
    moduleCount: course._count.modules,
    updatedAt: course.updatedAt,
  };
}

export class PrismaCourseManagementRepository implements CourseManagementRepository {
  async imageTargetExists(
    kind: CourseImageTarget,
    id: number,
  ): Promise<boolean> {
    if (kind === 'course') {
      return Boolean(
        await prisma.course.findUnique({ where: { id }, select: { id: true } }),
      );
    }
    if (kind === 'module') {
      return Boolean(
        await prisma.courseModule.findUnique({
          where: { id },
          select: { id: true },
        }),
      );
    }
    return Boolean(
      await prisma.courseContent.findFirst({
        where: { id, kind: 'LESSON' },
        select: { id: true },
      }),
    );
  }

  async listManaged(
    query: string,
    status: PublicationState | undefined,
    skip: number,
    take: number,
  ): Promise<{ items: ManagedCourse[]; totalItems: number }> {
    const where = {
      ...(query
        ? { title: { contains: query, mode: 'insensitive' as const } }
        : {}),
      ...(status ? { status: toPublicationStatus(status) } : {}),
    };
    const [courses, totalItems] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        include: { _count: { select: { modules: true } } },
      }),
      prisma.course.count({ where }),
    ]);
    return { items: courses.map(mapCourse), totalItems };
  }

  async createManaged(input: NewManagedCourse): Promise<ManagedCourse> {
    const course = await prisma.course.create({
      data: {
        createdById: input.createdById,
        title: input.title,
        description: input.description,
        coverImageUrl: input.coverImageUrl,
        coverImagePath: input.coverImagePath,
        status: PublicationStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: { _count: { select: { modules: true } } },
    });
    return mapCourse(course);
  }

  async getManaged(courseId: number): Promise<ManagedCourse | null> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { _count: { select: { modules: true } } },
    });
    return course ? mapCourse(course) : null;
  }

  async updateManaged(
    courseId: number,
    changes: ManagedCourseChanges,
  ): Promise<ManagedCourse | null> {
    return prisma.$transaction(async (transaction) => {
      const existing = await transaction.course.findUnique({
        where: { id: courseId },
        select: { status: true },
      });
      if (!existing) return null;

      let publishedAt: Date | null | undefined;
      if (
        changes.status === 'PUBLISHED' &&
        existing.status !== PublicationStatus.PUBLISHED
      ) {
        publishedAt = new Date();
      } else if (changes.status === 'DRAFT') {
        publishedAt = null;
      }

      const course = await transaction.course.update({
        where: { id: courseId },
        data: {
          ...(changes.title !== undefined ? { title: changes.title } : {}),
          ...(changes.description !== undefined
            ? { description: changes.description }
            : {}),
          ...(changes.coverImagePath !== undefined
            ? { coverImagePath: changes.coverImagePath }
            : {}),
          ...(changes.status !== undefined
            ? { status: toPublicationStatus(changes.status) }
            : {}),
          ...(publishedAt !== undefined ? { publishedAt } : {}),
        },
        include: { _count: { select: { modules: true } } },
      });
      return mapCourse(course);
    });
  }

  async listManagedModules(
    courseId: number,
  ): Promise<ManagedCourseModuleContext | null> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        status: true,
        modules: {
          orderBy: [{ position: 'asc' }, { id: 'asc' }],
          include: {
            _count: { select: { contents: true } },
            contents: {
              orderBy: [{ position: 'asc' }, { id: 'asc' }],
              select: {
                id: true,
                title: true,
                description: true,
                imagePath: true,
                kind: true,
                status: true,
                position: true,
                materials: {
                  orderBy: [{ position: 'asc' }, { id: 'asc' }],
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    mimeType: true,
                    sizeBytes: true,
                    position: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!course) return null;
    return {
      course: { id: course.id, title: course.title, status: course.status },
      items: course.modules.map(mapModule),
    };
  }

  async createManagedModule(
    courseId: number,
    input: NewManagedCourseModule,
  ): Promise<ManagedCourseModule | null> {
    return prisma.$transaction(async (transaction) => {
      const course = await transaction.course.findUnique({
        where: { id: courseId },
        select: { id: true },
      });
      if (!course) return null;

      const lastPosition = await transaction.courseModule.aggregate({
        where: { courseId },
        _max: { position: true },
      });
      const managedModule = await transaction.courseModule.create({
        data: {
          courseId,
          title: input.title,
          description: input.description,
          position: (lastPosition._max.position ?? -1) + 1,
          status: PublicationStatus.PUBLISHED,
        },
        include: { _count: { select: { contents: true } } },
      });
      return mapModule(managedModule);
    });
  }

  async updateManagedModule(
    courseId: number,
    moduleId: number,
    changes: ManagedCourseModuleChanges,
  ): Promise<ManagedCourseModule | null> {
    return prisma.$transaction(async (transaction) => {
      const existing = await transaction.courseModule.findFirst({
        where: { id: moduleId, courseId },
        select: { id: true },
      });
      if (!existing) return null;

      const managedModule = await transaction.courseModule.update({
        where: { id: moduleId },
        data: {
          ...(changes.title !== undefined ? { title: changes.title } : {}),
          ...(changes.description !== undefined
            ? { description: changes.description }
            : {}),
          ...(changes.imagePath !== undefined
            ? { imagePath: changes.imagePath }
            : {}),
          ...(changes.status !== undefined
            ? { status: toPublicationStatus(changes.status) }
            : {}),
        },
        include: { _count: { select: { contents: true } } },
      });
      return mapModule(managedModule);
    });
  }

  async reorderManagedModules(
    courseId: number,
    orderedIds: number[],
  ): Promise<boolean> {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.courseModule.findMany({
        where: { courseId },
        select: { id: true },
      });
      const currentIds = new Set(current.map((module) => module.id));
      if (
        current.length !== orderedIds.length ||
        new Set(orderedIds).size !== orderedIds.length ||
        orderedIds.some((id) => !currentIds.has(id))
      ) {
        return false;
      }

      await Promise.all(
        orderedIds.map((id, position) =>
          transaction.courseModule.update({
            where: { id },
            data: { position },
          }),
        ),
      );
      return true;
    });
  }

  async lessonExists(courseId: number, moduleId: number, contentId: number) {
    return Boolean(
      await prisma.courseContent.findFirst({
        where: {
          id: contentId,
          moduleId,
          kind: 'LESSON',
          module: { courseId },
        },
        select: { id: true },
      }),
    );
  }

  async getManagedLesson(
    courseId: number,
    moduleId: number,
    contentId: number,
  ): Promise<ManagedLessonRecord | null> {
    const lesson = await prisma.courseContent.findFirst({
      where: { id: contentId, moduleId, kind: 'LESSON', module: { courseId } },
      include: { materials: { orderBy: [{ position: 'asc' }, { id: 'asc' }] } },
    });
    return lesson as unknown as ManagedLessonRecord | null;
  }

  async createManagedLesson(
    moduleId: number,
    input: ManagedLessonChanges,
  ): Promise<ManagedLessonRecord> {
    return prisma.$transaction(async (transaction) => {
      const courseModule = await transaction.courseModule.findUnique({
        where: { id: moduleId },
        select: { id: true },
      });
      if (!courseModule) throw new Error('Course module not found.');
      const last = await transaction.courseContent.aggregate({
        where: { moduleId },
        _max: { position: true },
      });
      const created = await transaction.courseContent.create({
        data: {
          moduleId,
          title: input.title,
          description: input.description,
          imagePath: input.imagePath,
          body: input.body,
          videoUrl: input.videoUrl,
          kind: 'LESSON',
          status: PublicationStatus.DRAFT,
          position: (last._max.position ?? -1) + 1,
          materials: {
            create: input.materials.map((material) => ({
              name: material.name,
              description: material.description,
              storagePath: material.storagePath!,
              mimeType: material.mimeType,
              sizeBytes: material.sizeBytes,
              position: material.position,
            })),
          },
        },
        include: {
          materials: { orderBy: [{ position: 'asc' }, { id: 'asc' }] },
        },
      });
      return created as unknown as ManagedLessonRecord;
    });
  }

  async updateManagedLesson(
    courseId: number,
    moduleId: number,
    contentId: number,
    changes: ManagedLessonChanges,
  ): Promise<ManagedLessonRecord | null> {
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.courseContent.findFirst({
        where: {
          id: contentId,
          moduleId,
          kind: 'LESSON',
          module: { courseId },
        },
        select: { id: true, status: true },
      });
      if (!current) return null;
      const materialIds = changes.materials.flatMap((material) =>
        material.id === undefined ? [] : [material.id],
      );
      const ownedMaterialIds = await transaction.courseMaterial.findMany({
        where: { contentId, id: { in: materialIds } },
        select: { id: true },
      });
      if (ownedMaterialIds.length !== materialIds.length) return null;
      const publishedAt =
        changes.status === 'PUBLISHED'
          ? current.status === PublicationStatus.PUBLISHED
            ? undefined
            : new Date()
          : changes.status === 'DRAFT'
            ? null
            : undefined;
      await transaction.courseContent.update({
        where: { id: contentId },
        data: {
          title: changes.title,
          description: changes.description,
          imagePath: changes.imagePath,
          body: changes.body,
          videoUrl: changes.videoUrl,
          ...(changes.status
            ? { status: toPublicationStatus(changes.status) }
            : {}),
          ...(publishedAt !== undefined ? { publishedAt } : {}),
        },
      });
      await transaction.courseMaterial.deleteMany({
        where: {
          contentId,
          ...(materialIds.length ? { id: { notIn: materialIds } } : {}),
        },
      });
      for (const material of changes.materials) {
        const data = {
          name: material.name,
          description: material.description,
          storagePath: material.storagePath,
          mimeType: material.mimeType,
          sizeBytes: material.sizeBytes,
          position: material.position,
        };
        if (material.id) {
          const { storagePath, ...existingData } = data;
          await transaction.courseMaterial.update({
            where: { id: material.id },
            data: { ...existingData, ...(storagePath ? { storagePath } : {}) },
          });
        } else
          await transaction.courseMaterial.create({
            data: { ...data, storagePath: data.storagePath!, contentId },
          });
      }
      return (await transaction.courseContent.findUniqueOrThrow({
        where: { id: contentId },
        include: {
          materials: { orderBy: [{ position: 'asc' }, { id: 'asc' }] },
        },
      })) as unknown as ManagedLessonRecord;
    });
  }

  async reorderManagedLessons(
    moduleId: number,
    orderedIds: number[],
  ): Promise<boolean> {
    return prisma.$transaction(async (transaction) => {
      const contents = await transaction.courseContent.findMany({
        where: { moduleId },
        orderBy: [{ position: 'asc' }, { id: 'asc' }],
        select: { id: true, kind: true },
      });
      const lessonIds = contents
        .filter((item) => item.kind === 'LESSON')
        .map((item) => item.id);
      if (
        lessonIds.length !== orderedIds.length ||
        new Set(orderedIds).size !== orderedIds.length ||
        orderedIds.some((id) => !lessonIds.includes(id))
      )
        return false;
      let index = 0;
      const finalOrder = contents.map((item) =>
        item.kind === 'LESSON' ? orderedIds[index++]! : item.id,
      );
      await Promise.all(
        finalOrder.map((id, position) =>
          transaction.courseContent.update({
            where: { id },
            data: { position },
          }),
        ),
      );
      return true;
    });
  }
}
