import { NextResponse } from 'next/server';
import { isSameOrigin } from '../../../../../lib/authentication/requestOrigin';
import { requestAdminApi } from '../../../../../lib/courses/adminCourseApi';

function forward(response: Response) {
  return new NextResponse(response.body, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
  });
}

export async function GET(_request: Request, context: { params: Promise<{ bannerId: string }> }) {
  const { bannerId } = await context.params;
  return forward(await requestAdminApi(`/admin/banners/${encodeURIComponent(bannerId)}`));
}

export async function PATCH(request: Request, context: { params: Promise<{ bannerId: string }> }) {
  if (!isSameOrigin(request)) return NextResponse.json({ message: 'Origem não autorizada.' }, { status: 403 });
  const { bannerId } = await context.params;
  return forward(await requestAdminApi(`/admin/banners/${encodeURIComponent(bannerId)}`, { method: 'PATCH', body: await request.text() }));
}
