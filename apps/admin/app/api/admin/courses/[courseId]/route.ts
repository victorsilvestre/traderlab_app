import { NextResponse } from 'next/server';
import { isSameOrigin } from '../../../../../lib/authentication/requestOrigin';
import { getAdminCourse, requestAdminApi } from '../../../../../lib/courses/adminCourseApi';

type RouteContext = { params: Promise<{ courseId: string }> };

function courseIdFrom(value: string): number | null {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { courseId: rawId } = await context.params;
  const courseId = courseIdFrom(rawId);
  if (!courseId) return NextResponse.json({ message: 'Curso não encontrado.' }, { status: 404 });
  const response = await getAdminCourse(courseId);
  return new NextResponse(response.body, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: 'Origem não autorizada.' }, { status: 403 });
  }
  const { courseId: rawId } = await context.params;
  const courseId = courseIdFrom(rawId);
  if (!courseId) return NextResponse.json({ message: 'Curso não encontrado.' }, { status: 404 });
  const body = await request.text();
  const response = await requestAdminApi(`/admin/courses/${courseId}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body,
  });
  return new NextResponse(response.body, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  });
}

