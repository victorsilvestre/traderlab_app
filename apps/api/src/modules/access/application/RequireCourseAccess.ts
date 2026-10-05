import { CourseAccessError } from '../domain/CourseAccessError.js';
import type { CourseAccessRepository } from '../domain/CourseAccessRepository.js';

export class RequireCourseAccess {
  constructor(private readonly repository: CourseAccessRepository) {}

  async execute(studentId: string, courseId: number): Promise<void> {
    const hasAccess = await this.repository.hasActiveEnrollment(
      studentId,
      courseId,
    );
    if (!hasAccess) throw new CourseAccessError();
  }
}
