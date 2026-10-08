import type {
  AdminEnrollmentInputDto,
  AdminEnrollmentOptionsDto,
  AdminEnrollmentPageDto,
} from '@traderlab/contracts';

export type EnrollmentFilters = {
  query: string;
  courseId: number | null;
  status: 'active' | 'revoked' | null;
  page: number;
  pageSize: number;
};

export interface EnrollmentRepository {
  list(filters: EnrollmentFilters): Promise<AdminEnrollmentPageDto>;
  options(query: string, userId: string | null): Promise<AdminEnrollmentOptionsDto>;
  create(input: AdminEnrollmentInputDto): Promise<{ id: number; grantedAt: Date }>;
}
