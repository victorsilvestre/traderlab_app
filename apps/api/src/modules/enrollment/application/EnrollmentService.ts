import type {
  AdminEnrollmentCreatedDto,
  AdminEnrollmentInputDto,
  AdminEnrollmentOptionsDto,
  AdminEnrollmentPageDto,
} from '@traderlab/contracts';
import type { EnrollmentRepository } from '../domain/Enrollment.js';
import { EnrollmentError } from '../domain/EnrollmentError.js';

const pageSize = 25;

export class EnrollmentService {
  constructor(private readonly enrollments: EnrollmentRepository) {}

  list(input: {
    query?: string;
    courseId?: number;
    status?: string;
    page?: number;
  }): Promise<AdminEnrollmentPageDto> {
    const status = input.status;
    if (status && status !== 'active' && status !== 'revoked') {
      throw new EnrollmentError('O filtro de situação não é válido.', 400);
    }
    return this.enrollments.list({
      query: input.query?.trim().slice(0, 120) ?? '',
      courseId: input.courseId && input.courseId > 0 ? input.courseId : null,
      status: status as 'active' | 'revoked' | null,
      page: Math.max(1, Math.floor(input.page ?? 1)),
      pageSize,
    });
  }

  options(query = '', userId: string | null = null): Promise<AdminEnrollmentOptionsDto> {
    return this.enrollments.options(query.trim().slice(0, 120), userId);
  }

  async create(input: AdminEnrollmentInputDto): Promise<AdminEnrollmentCreatedDto> {
    if (!input.userId || !Number.isSafeInteger(input.courseId) || input.courseId < 1) {
      throw new EnrollmentError('Selecione um usuário e um curso válidos.', 400);
    }
    try {
      const enrollment = await this.enrollments.create(input);
      return { id: enrollment.id, grantedAt: enrollment.grantedAt.toISOString() };
    } catch (error) {
      if (error instanceof EnrollmentError) throw error;
      if (
        typeof error === 'object' && error !== null &&
        'code' in error && error.code === 'P2002'
      ) {
        throw new EnrollmentError('Este usuário já possui uma matrícula neste curso.', 409);
      }
      throw error;
    }
  }
}
