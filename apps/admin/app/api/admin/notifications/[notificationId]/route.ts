import { NextResponse } from 'next/server';
import { requestAdminApi } from '../../../../../lib/courses/adminCourseApi';

type RouteContext = { params: Promise<{ notificationId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { notificationId } = await context.params;
  const url = new URL(request.url);
  const page = url.searchParams.get('page') ?? '1';
  const response = await requestAdminApi(
    `/admin/notifications/${encodeURIComponent(notificationId)}?page=${encodeURIComponent(page)}`,
  );
  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}
