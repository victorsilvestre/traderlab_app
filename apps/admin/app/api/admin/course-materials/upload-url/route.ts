import { NextResponse } from 'next/server';
import { isSameOrigin } from '../../../../../lib/authentication/requestOrigin';
import { requestAdminApi } from '../../../../../lib/courses/adminCourseApi';

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return NextResponse.json(
      { message: 'Origem não autorizada.' },
      { status: 403 },
    );
  const response = await requestAdminApi('/admin/course-materials/upload-url', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: await request.text(),
  });
  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      'content-type':
        response.headers.get('content-type') ?? 'application/json',
    },
  });
}
