import 'server-only';
import { requestAdminApi } from '../courses/adminCourseApi';

export function getAdminNotifications(page = 1) {
  const params = new URLSearchParams({ page: String(page) });
  return requestAdminApi(`/admin/notifications?${params.toString()}`);
}

export function getAdminNotification(notificationId: number, page = 1) {
  const params = new URLSearchParams({ page: String(page) });
  return requestAdminApi(
    `/admin/notifications/${notificationId}?${params.toString()}`,
  );
}

export function getAdminNotificationCourses() {
  return requestAdminApi('/admin/notifications/courses');
}
