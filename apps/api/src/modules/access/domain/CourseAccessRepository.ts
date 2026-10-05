export interface CourseAccessRepository {
  hasActiveEnrollment(studentId: string, courseId: number): Promise<boolean>;
}
