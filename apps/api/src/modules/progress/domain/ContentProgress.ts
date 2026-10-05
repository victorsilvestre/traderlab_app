export type ContentProgressRecord = {
  contentId: number;
  lastAccessedAt: Date;
  completedAt: Date | null;
};

export interface ContentProgressRepository {
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
