import 'server-only';
import { requestAdminApi } from '../courses/adminCourseApi';

export function getAdminBanners() {
  return requestAdminApi('/admin/banners');
}
