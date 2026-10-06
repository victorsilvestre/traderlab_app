import type {
  ContentProgressRecord,
  ContentProgressRepository,
} from '../domain/ContentProgress.js';
import type { RecentContentDto } from '@traderlab/contracts';

export class ContentProgressService {
  constructor(private readonly repository: ContentProgressRepository) {}

  async listRecentForStudent(studentId: string): Promise<RecentContentDto[]> {
    const records = await this.repository.listRecentForStudent(studentId, 3);
    return records.map((record) => ({
      contentId: record.contentId,
      title: record.title,
      kind: record.kind.toLowerCase() as RecentContentDto['kind'],
      courseId: record.courseId,
      courseTitle: record.courseTitle,
      moduleId: record.moduleId,
      moduleTitle: record.moduleTitle,
      completed: record.completedAt !== null,
      lastAccessedAt: record.lastAccessedAt.toISOString(),
    }));
  }

  listForCourse(studentId: string, courseId: number) {
    return this.repository.listForCourse(studentId, courseId);
  }

  findForContent(studentId: string, contentId: number) {
    return this.repository.findForContent(studentId, contentId);
  }

  recordAccess(studentId: string, contentId: number) {
    return this.repository.recordAccess(studentId, contentId);
  }

  markCompleted(studentId: string, contentId: number) {
    return this.repository.markCompleted(studentId, contentId);
  }
}

export function toProgressPercent(totalCount: number, completedCount: number) {
  if (totalCount === 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
}

export function newestAccessed(
  records: ContentProgressRecord[],
): ContentProgressRecord | null {
  return records.reduce<ContentProgressRecord | null>(
    (newest, current) =>
      !newest || current.lastAccessedAt > newest.lastAccessedAt
        ? current
        : newest,
    null,
  );
}
