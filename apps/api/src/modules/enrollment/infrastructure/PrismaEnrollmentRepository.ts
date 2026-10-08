import { EnrollmentSource, EnrollmentStatus, PublicationStatus } from '../../../generated/prisma/client.js';
import { prisma } from '../../../database/prisma.js';
import type { EnrollmentFilters, EnrollmentRepository } from '../domain/Enrollment.js';
import { EnrollmentError } from '../domain/EnrollmentError.js';

export class PrismaEnrollmentRepository implements EnrollmentRepository {
  async list(filters: EnrollmentFilters) {
    const search = filters.query;
    const where = {
      ...(filters.courseId ? { courseId: filters.courseId } : {}),
      ...(filters.status ? { status: filters.status.toUpperCase() as EnrollmentStatus } : {}),
      ...(search ? {
        OR: [
          { student: { name: { contains: search, mode: 'insensitive' as const } } },
          { student: { email: { contains: search, mode: 'insensitive' as const } } },
          { student: { phone: { contains: search, mode: 'insensitive' as const } } },
          { course: { title: { contains: search, mode: 'insensitive' as const } } },
        ],
      } : {}),
    };
    const [records, totalItems] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        orderBy: [{ grantedAt: 'desc' }, { id: 'desc' }],
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
        select: {
          id: true, studentId: true, source: true, status: true, grantedAt: true,
          student: { select: { name: true, email: true, phone: true, role: true } },
          course: { select: { id: true, title: true } },
        },
      }),
      prisma.enrollment.count({ where }),
    ]);
    return {
      items: records.map((record) => ({
        id: record.id,
        userId: record.studentId,
        userName: record.student.name,
        userEmail: record.student.email,
        userPhone: record.student.phone,
        userRole: record.student.role.toLowerCase(),
        courseId: record.course.id,
        courseTitle: record.course.title,
        source: record.source.toLowerCase() as 'purchase' | 'invitation' | 'manual',
        status: record.status.toLowerCase() as 'active' | 'revoked',
        grantedAt: record.grantedAt.toISOString(),
      })),
      page: filters.page,
      pageSize: filters.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / filters.pageSize),
    };
  }

  async options(query: string, userId: string | null) {
    const [users, courses, publishedCourses] = await Promise.all([
      prisma.userProfile.findMany({
        where: userId
          ? { id: userId }
          : query
            ? { OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query, mode: 'insensitive' } },
              ] }
            : {},
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        take: userId ? 1 : 20,
        select: { id: true, name: true, email: true, phone: true, role: true },
      }),
      prisma.course.findMany({
        orderBy: { title: 'asc' },
        select: { id: true, title: true },
      }),
      prisma.course.findMany({
        where: { status: PublicationStatus.PUBLISHED },
        orderBy: { title: 'asc' },
        select: { id: true, title: true },
      }),
    ]);
    return {
      users: users.map((user) => ({ ...user, role: user.role.toLowerCase() })),
      courses,
      publishedCourses,
    };
  }

  async create(input: { userId: string; courseId: number }) {
    const [user, course, existing] = await Promise.all([
      prisma.userProfile.findUnique({ where: { id: input.userId }, select: { id: true } }),
      prisma.course.findUnique({ where: { id: input.courseId }, select: { id: true, status: true } }),
      prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: input.userId, courseId: input.courseId } },
        select: { id: true },
      }),
    ]);
    if (!user) throw new EnrollmentError('O usuário selecionado não foi encontrado.', 404);
    if (!course) throw new EnrollmentError('O curso selecionado não foi encontrado.', 404);
    if (course.status !== PublicationStatus.PUBLISHED) {
      throw new EnrollmentError('Só é possível matricular usuários em cursos publicados.', 400);
    }
    if (existing) throw new EnrollmentError('Este usuário já possui uma matrícula neste curso.', 409);
    const created = await prisma.enrollment.create({
      data: {
        studentId: input.userId,
        courseId: input.courseId,
        source: EnrollmentSource.MANUAL,
        status: EnrollmentStatus.ACTIVE,
      },
      select: { id: true, grantedAt: true },
    });
    return created;
  }
}
