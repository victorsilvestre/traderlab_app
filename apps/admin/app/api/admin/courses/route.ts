import { NextResponse } from 'next/server';
import { isSameOrigin } from '../../../../lib/authentication/requestOrigin';
import { getAdminCourses, requestAdminApi } from '../../../../lib/courses/adminCourseApi';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query') ?? '';
  const status = url.searchParams.get('status') ?? undefined;
  const pageValue = Number(url.searchParams.get('page') ?? '1');
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const response = await getAdminCourses({ query, status, page });
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
  const response = await requestAdminApi('/admin/courses', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  });
  return new NextResponse(response.body, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  });
}
