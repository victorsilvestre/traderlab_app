import { NextResponse } from 'next/server';
import { isSameOrigin } from '../../../../lib/authentication/requestOrigin';
import { requestAdminApi } from '../../../../lib/courses/adminCourseApi';

function forward(response: Response) {
  return new NextResponse(response.body, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  });
}

export async function GET() {
  return forward(await requestAdminApi('/admin/banners'));
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: 'Origem não autorizada.' }, { status: 403 });
  return forward(await requestAdminApi('/admin/banners', { method: 'POST', body: await request.text() }));
}
