import 'server-only';
import { requestAdminApi } from '../courses/adminCourseApi';

export async function getAdminEnrollments(filters: {
  query?: string;
  courseId?: number;
  status?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (filters.query) params.set('query', filters.query);
  if (filters.courseId) params.set('courseId', String(filters.courseId));
  if (filters.status) params.set('status', filters.status);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  return requestAdminApi(`/admin/enrollments${params.size ? `?${params.toString()}` : ''}`);
}

export async function getAdminEnrollmentOptions(query = '', userId?: string) {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (userId) params.set('userId', userId);
  return requestAdminApi(`/admin/enrollments/options${params.size ? `?${params.toString()}` : ''}`);
}
