import 'server-only';
import { createSupabaseServerClient } from '../supabase/server';

export async function requestAdminApi(path: string, init: RequestInit = {}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (error || !token) {
    return Response.json(
      { message: 'Sua sessão expirou. Entre novamente.' },
      { status: 401 },
    );
  }

  const headers = new Headers(init.headers);
  headers.set('authorization', `Bearer ${token}`);
  if (init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  try {
    return await fetch(
      `${process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, '')}${path}`,
      {
        ...init,
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      },
    );
  } catch {
    return Response.json(
      { message: 'Não foi possível conectar à API. Tente novamente.' },
      { status: 503 },
    );
  }
}

export async function getAdminCourses(
  filters: { query?: string; status?: string; page?: number } = {},
) {
  const params = new URLSearchParams();
  if (filters.query) params.set('query', filters.query);
  if (filters.status) params.set('status', filters.status);
  if (filters.page && filters.page > 1)
    params.set('page', String(filters.page));
  const suffix = params.size ? `?${params.toString()}` : '';
  return requestAdminApi(`/admin/courses${suffix}`);
}

export async function getAdminCourse(courseId: number) {
  return requestAdminApi(`/admin/courses/${courseId}`);
}

export async function getAdminCourseModules(courseId: number) {
  return requestAdminApi(`/admin/courses/${courseId}/modules`);
}

export async function getAdminLesson(
  courseId: number,
  moduleId: number,
  contentId: number,
) {
  return requestAdminApi(
    `/admin/courses/${courseId}/modules/${moduleId}/lessons/${contentId}`,
  );
}
