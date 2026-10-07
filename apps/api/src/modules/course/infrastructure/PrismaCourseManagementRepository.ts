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
    kind: 'LESSON' | 'MATERIAL';
    status: PublicationStatus;
    position: number;
    materials: Array<{
      id: number;
      name: string;
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
      await prisma.courseContent.findUnique({
        where: { id },
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
        status: PublicationStatus.DRAFT,
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
                kind: true,
                status: true,
                position: true,
                materials: {
                  orderBy: [{ position: 'asc' }, { id: 'asc' }],
                  select: {
                    id: true,
                    name: true,
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
          status: PublicationStatus.DRAFT,
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
}
