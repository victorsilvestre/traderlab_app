import {
  CourseContentKind as PrismaCourseContentKind,
  PublicationStatus,
} from '../../../generated/prisma/client.js';
import { prisma } from '../../../database/prisma.js';
import type {
  CourseCatalogSearchRecord,
  CourseContentLocation,
  CourseContentSearchRecord,
  CourseContentRecord,
  CourseModuleRecord,
  CourseRecord,
  CourseSearchRecord,
  CourseRepository,
} from '../domain/Course.js';

function mapContent(content: {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  kind: PrismaCourseContentKind;
  body: string;
  videoUrl: string | null;
  resourceUrl: string | null;
  imagePath: string | null;
  position: number;
  status: PublicationStatus;
}): CourseContentRecord {
  return {
    ...content,
    kind: content.kind,
    status: content.status,
  };
}

function mapModules(
  modules: Array<{
    id: number;
    title: string;
    description: string;
    imageUrl: string | null;
    imagePath: string | null;
    position: number;
    status: PublicationStatus;
    contents: Array<{
      id: number;
      moduleId: number;
      title: string;
      description: string;
      kind: PrismaCourseContentKind;
      body: string;
      videoUrl: string | null;
      resourceUrl: string | null;
      imagePath: string | null;
      position: number;
      status: PublicationStatus;
    }>;
  }>,
): CourseModuleRecord[] {
  return modules.map((module) => ({
    id: module.id,
    title: module.title,
    description: module.description,
    imageUrl: module.imageUrl,
    imagePath: module.imagePath,
    position: module.position,
    status: module.status,
    contents: module.contents.map(mapContent),
  }));
}

const publishedModules = {
  modules: {
    where: { status: PublicationStatus.PUBLISHED },
    orderBy: { position: 'asc' as const },
    include: {
      contents: {
        where: { status: PublicationStatus.PUBLISHED },
        orderBy: { position: 'asc' as const },
      },
    },
  },
};

export class PrismaCourseRepository implements CourseRepository {
  async listAccessiblePublished(studentId: string): Promise<CourseRecord[]> {
    const courses = await prisma.course.findMany({
      where: {
        status: PublicationStatus.PUBLISHED,
        enrollments: {
          some: { studentId, status: 'ACTIVE' },
        },
      },
      orderBy: { title: 'asc' },
      include: publishedModules,
    });

    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      coverImageUrl: course.coverImageUrl,
      coverImagePath: course.coverImagePath,
      status: course.status,
      modules: mapModules(course.modules),
    }));
  }

  async findPublishedCourse(courseId: number): Promise<CourseRecord | null> {
    const course = await prisma.course.findFirst({
      where: { id: courseId, status: PublicationStatus.PUBLISHED },
      include: publishedModules,
    });
    if (!course) return null;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      coverImageUrl: course.coverImageUrl,
      coverImagePath: course.coverImagePath,
      status: course.status,
      modules: mapModules(course.modules),
    };
  }

  async findPublishedContent(
    courseId: number,
    contentId: number,
  ): Promise<CourseContentLocation | null> {
    const content = await prisma.courseContent.findFirst({
      where: {
        id: contentId,
        status: PublicationStatus.PUBLISHED,
        module: {
          status: PublicationStatus.PUBLISHED,
          courseId,
          course: { status: PublicationStatus.PUBLISHED },
        },
      },
      include: {
        module: {
          select: {
            title: true,
            course: { select: { id: true, title: true } },
          },
        },
        materials: { orderBy: { position: 'asc' } },
      },
    });
    if (!content) return null;

    return {
      ...mapContent(content),
      courseId: content.module.course.id,
      courseTitle: content.module.course.title,
      moduleTitle: content.module.title,
      materials: content.materials,
    };
  }

  async findPublishedMaterial(
    courseId: number,
    contentId: number,
    materialId: number,
  ) {
    return prisma.courseMaterial.findFirst({
      where: {
        id: materialId,
        contentId,
        content: {
          id: contentId,
          kind: PrismaCourseContentKind.LESSON,
          status: PublicationStatus.PUBLISHED,
          module: {
            status: PublicationStatus.PUBLISHED,
            courseId,
            course: { status: PublicationStatus.PUBLISHED },
          },
        },
      },
      select: {
        id: true,
        contentId: true,
        name: true,
        description: true,
        storagePath: true,
        mimeType: true,
        sizeBytes: true,
        position: true,
      },
    });
  }

  async searchPublishedCourseItems(
    courseId: number,
    query: string,
    limit: number,
  ): Promise<CourseSearchRecord[]> {
    const matches = [
      { title: { contains: query, mode: 'insensitive' as const } },
      { description: { contains: query, mode: 'insensitive' as const } },
    ];
    const [modules, contents] = await Promise.all([
      prisma.courseModule.findMany({
        where: {
          courseId,
          status: PublicationStatus.PUBLISHED,
          OR: matches,
        },
        take: limit,
        orderBy: { position: 'asc' },
        select: { id: true, title: true, description: true },
      }),
      prisma.courseContent.findMany({
        where: {
          status: PublicationStatus.PUBLISHED,
          OR: matches,
          module: {
            status: PublicationStatus.PUBLISHED,
            courseId,
            course: { status: PublicationStatus.PUBLISHED },
          },
        },
        take: limit,
        orderBy: [{ module: { position: 'asc' } }, { position: 'asc' }],
        include: { module: { select: { title: true } } },
      }),
    ]);

    const moduleMatches: CourseSearchRecord[] = modules.map((module) => ({
      ...module,
      resultType: 'MODULE',
    }));
    const contentMatches: CourseContentSearchRecord[] = contents.map(
      (content) => ({
        ...mapContent(content),
        resultType: 'CONTENT',
        courseId,
        moduleTitle: content.module.title,
      }),
    );

    return [...moduleMatches, ...contentMatches];
  }

  async searchAccessibleCatalog(
    studentId: string,
    query: string,
    limit: number,
  ): Promise<CourseCatalogSearchRecord[]> {
    const contains = [
      { title: { contains: query, mode: 'insensitive' as const } },
      { description: { contains: query, mode: 'insensitive' as const } },
    ];
    const courseFilter = {
      status: PublicationStatus.PUBLISHED,
      enrollments: { some: { studentId, status: 'ACTIVE' as const } },
    };
    const [courses, modules, contents] = await Promise.all([
      prisma.course.findMany({
        where: { ...courseFilter, OR: contains },
        take: limit,
        orderBy: { title: 'asc' },
        select: { id: true, title: true, description: true },
      }),
      prisma.courseModule.findMany({
        where: {
          status: PublicationStatus.PUBLISHED,
          OR: contains,
          course: courseFilter,
        },
        take: limit,
        orderBy: [{ course: { title: 'asc' } }, { position: 'asc' }],
        select: {
          id: true,
          title: true,
          description: true,
          courseId: true,
          course: { select: { title: true } },
        },
      }),
      prisma.courseContent.findMany({
        where: {
          status: PublicationStatus.PUBLISHED,
          OR: contains,
          module: {
            status: PublicationStatus.PUBLISHED,
            course: courseFilter,
          },
        },
        take: limit,
        orderBy: [
          { module: { course: { title: 'asc' } } },
          { module: { position: 'asc' } },
          { position: 'asc' },
        ],
        include: {
          module: {
            select: {
              id: true,
              title: true,
              course: { select: { id: true, title: true } },
            },
          },
        },
      }),
    ]);

    return [
      ...courses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        kind: 'COURSE' as const,
        courseId: course.id,
        courseTitle: course.title,
        moduleId: null,
        moduleTitle: null,
      })),
      ...modules.map((module) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        kind: 'MODULE' as const,
        courseId: module.courseId,
        courseTitle: module.course.title,
        moduleId: module.id,
        moduleTitle: module.title,
      })),
      ...contents.map((content) => ({
        id: content.id,
        title: content.title,
        description: content.description,
        kind: content.kind,
        courseId: content.module.course.id,
        courseTitle: content.module.course.title,
        moduleId: content.module.id,
        moduleTitle: content.module.title,
      })),
    ];
  }
}
