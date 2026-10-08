import 'server-only';
import { requestAdminApi } from '../courses/adminCourseApi';

export function getAdminUsers(input: { query?: string; page?: number } = {}) {
  const params = new URLSearchParams();
  if (input.query) params.set('query', input.query);
  if (input.page && input.page > 1) params.set('page', String(input.page));
  const suffix = params.size ? `?${params.toString()}` : '';
  return requestAdminApi(`/admin/users${suffix}`);
}

export function getAdminUser(userId: string) {
  return requestAdminApi(`/admin/users/${encodeURIComponent(userId)}`);
}
