import { NextResponse } from 'next/server';
import { isSameOrigin } from '../../../../../../../../../lib/authentication/requestOrigin';
import { requestAdminApi } from '../../../../../../../../../lib/courses/adminCourseApi';

type RouteContext = {
  params: Promise<{ courseId: string; moduleId: string; contentId: string }>;
};

async function proxy(
  request: Request,
  context: RouteContext,
  method: 'GET' | 'PATCH',
) {
  if (method === 'PATCH' && !isSameOrigin(request))
    return NextResponse.json(
      { message: 'Origem não autorizada.' },
      { status: 403 },
    );
  const { courseId, moduleId, contentId } = await context.params;
  const response = await requestAdminApi(
    `/admin/courses/${courseId}/modules/${moduleId}/lessons/${contentId}`,
    {
      method,
      ...(method === 'PATCH'
        ? {
            headers: { 'content-type': 'application/json' },
            body: await request.text(),
          }
        : {}),
    },
  );
  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      'content-type':
        response.headers.get('content-type') ?? 'application/json',
    },
  });
}

export async function GET(request: Request, context: RouteContext) {
  return proxy(request, context, 'GET');
}
export async function PATCH(request: Request, context: RouteContext) {
  return proxy(request, context, 'PATCH');
}
