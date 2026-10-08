import { NextResponse } from 'next/server';
import { isSameOrigin } from '../../../../lib/authentication/requestOrigin';
import { requestAdminApi } from '../../../../lib/courses/adminCourseApi';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = new URLSearchParams();
  for (const key of ['query', 'courseId', 'status', 'page']) {
    const value = url.searchParams.get(key);
    if (value) params.set(key, value);
  }
  const response = await requestAdminApi(`/admin/enrollments${params.size ? `?${params.toString()}` : ''}`);
  return new NextResponse(response.body, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: 'Origem não autorizada.' }, { status: 403 });
  }
  const body = await request.text();
  const response = await requestAdminApi('/admin/enrollments', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  });
  return new NextResponse(response.body, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  });
}
