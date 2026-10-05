import type {
  ContentProgressRecord,
  ContentProgressRepository,
} from '../domain/ContentProgress.js';

export class ContentProgressService {
  constructor(private readonly repository: ContentProgressRepository) {}

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
