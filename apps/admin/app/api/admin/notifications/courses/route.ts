import { NextResponse } from 'next/server';
import { requestAdminApi } from '../../../../../lib/courses/adminCourseApi';

export async function GET() {
  const response = await requestAdminApi('/admin/notifications/courses');
  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}
