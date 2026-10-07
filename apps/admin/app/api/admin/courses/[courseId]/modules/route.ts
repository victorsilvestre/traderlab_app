import { NextResponse } from 'next/server';
import { isSameOrigin } from '../../../../../../lib/authentication/requestOrigin';
import { requestAdminApi } from '../../../../../../lib/courses/adminCourseApi';

type RouteContext = { params: Promise<{ courseId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { courseId } = await context.params;
  const response = await requestAdminApi(`/admin/courses/${courseId}/modules`);
  return new NextResponse(response.body, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  });
}

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: 'Origem não autorizada.' }, { status: 403 });
  }
  const { courseId } = await context.params;
  const response = await requestAdminApi(`/admin/courses/${courseId}/modules`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: await request.text(),
  });
  return new NextResponse(response.body, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  });
}
