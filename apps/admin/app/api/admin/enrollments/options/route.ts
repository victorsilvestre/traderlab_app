import { NextResponse } from 'next/server';
import { requestAdminApi } from '../../../../../lib/courses/adminCourseApi';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = new URLSearchParams();
  const query = url.searchParams.get('query');
  const userId = url.searchParams.get('userId');
  if (query) params.set('query', query);
  if (userId) params.set('userId', userId);
  const response = await requestAdminApi(`/admin/enrollments/options${params.size ? `?${params.toString()}` : ''}`);
  return new NextResponse(response.body, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  });
}
