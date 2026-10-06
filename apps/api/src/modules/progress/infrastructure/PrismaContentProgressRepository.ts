import { prisma } from '../../../database/prisma.js';
import type {
  ContentProgressRecord,
  ContentProgressRepository,
  RecentContentRecord,
} from '../domain/ContentProgress.js';

function toRecord(progress: {
  contentId: number;
  lastAccessedAt: Date;
  completedAt: Date | null;
}): ContentProgressRecord {
  return {
    contentId: progress.contentId,
    lastAccessedAt: progress.lastAccessedAt,
    completedAt: progress.completedAt,
  };
}

export class PrismaContentProgressRepository implements ContentProgressRepository {
  async listRecentForStudent(
    studentId: string,
    limit: number,
  ): Promise<RecentContentRecord[]> {
    const records = await prisma.contentProgress.findMany({
      where: {
        studentId,
        content: {
          status: 'PUBLISHED',
          module: {
            status: 'PUBLISHED',
            course: {
              status: 'PUBLISHED',
              enrollments: { some: { studentId, status: 'ACTIVE' } },
            },
          },
        },
      },
      orderBy: [{ lastAccessedAt: 'desc' }, { contentId: 'desc' }],
      take: limit,
      select: {
        contentId: true,
        lastAccessedAt: true,
        completedAt: true,
        content: {
          select: {
            id: true,
            title: true,
            kind: true,
            module: {
              select: {
                id: true,
                title: true,
                course: { select: { id: true, title: true } },
              },
            },
          },
        },
      },
    });

    return records.map((record) => ({
      contentId: record.content.id,
      lastAccessedAt: record.lastAccessedAt,
      completedAt: record.completedAt,
      title: record.content.title,
      kind: record.content.kind,
      courseId: record.content.module.course.id,
      courseTitle: record.content.module.course.title,
      moduleId: record.content.module.id,
      moduleTitle: record.content.module.title,
    }));
  }

  async listForCourse(studentId: string, courseId: number) {
    const records = await prisma.contentProgress.findMany({
      where: {
        studentId,
        content: {
          status: 'PUBLISHED',
          module: {
            status: 'PUBLISHED',
            courseId,
          },
        },
      },
      select: { contentId: true, lastAccessedAt: true, completedAt: true },
    });
    return records.map(toRecord);
  }

  async findForContent(studentId: string, contentId: number) {
    const record = await prisma.contentProgress.findUnique({
      where: { studentId_contentId: { studentId, contentId } },
      select: { contentId: true, lastAccessedAt: true, completedAt: true },
    });
    return record ? toRecord(record) : null;
  }

  async recordAccess(studentId: string, contentId: number) {
    const record = await prisma.contentProgress.upsert({
      where: { studentId_contentId: { studentId, contentId } },
      create: { studentId, contentId },
      update: { lastAccessedAt: new Date() },
      select: { contentId: true, lastAccessedAt: true, completedAt: true },
    });
    return toRecord(record);
  }

  async markCompleted(studentId: string, contentId: number) {
    const now = new Date();
    const existing = await prisma.contentProgress.findUnique({
      where: { studentId_contentId: { studentId, contentId } },
      select: { completedAt: true },
    });
    if (existing?.completedAt) {
      return this.recordAccess(studentId, contentId);
    }

    const record = await prisma.contentProgress.upsert({
      where: { studentId_contentId: { studentId, contentId } },
      create: { studentId, contentId, lastAccessedAt: now, completedAt: now },
      update: { lastAccessedAt: now, completedAt: now },
      select: { contentId: true, lastAccessedAt: true, completedAt: true },
    });
    return toRecord(record);
  }
}
