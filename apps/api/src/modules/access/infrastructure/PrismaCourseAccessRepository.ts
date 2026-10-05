import { EnrollmentStatus } from '../../../generated/prisma/client.js';
import { prisma } from '../../../database/prisma.js';
import type { CourseAccessRepository } from '../domain/CourseAccessRepository.js';

export class PrismaCourseAccessRepository implements CourseAccessRepository {
  async hasActiveEnrollment(
    studentId: string,
    courseId: number,
  ): Promise<boolean> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
      select: { status: true },
    });
    return enrollment?.status === EnrollmentStatus.ACTIVE;
  }
}
