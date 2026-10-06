export type ContentProgressRecord = {
  contentId: number;
  lastAccessedAt: Date;
  completedAt: Date | null;
};

export type RecentContentRecord = ContentProgressRecord & {
  title: string;
  kind: 'LESSON' | 'MATERIAL';
  courseId: number;
  courseTitle: string;
  moduleId: number;
  moduleTitle: string;
};

export interface ContentProgressRepository {
  listRecentForStudent(
    studentId: string,
    limit: number,
  ): Promise<RecentContentRecord[]>;
  listForCourse(
    studentId: string,
    courseId: number,
  ): Promise<ContentProgressRecord[]>;
  findForContent(
    studentId: string,
    contentId: number,
  ): Promise<ContentProgressRecord | null>;
  recordAccess(
    studentId: string,
    contentId: number,
  ): Promise<ContentProgressRecord>;
  markCompleted(
    studentId: string,
    contentId: number,
  ): Promise<ContentProgressRecord>;
}
