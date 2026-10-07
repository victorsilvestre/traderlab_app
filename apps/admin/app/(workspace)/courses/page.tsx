import { redirect } from 'next/navigation';
import type { ManagedCoursePageDto, ManagedCourseStatusDto } from '@traderlab/contracts';
import { AdminCourseCatalog } from '../../../components/ui/AdminCourseCatalog';
import { getAdminCourses } from '../../../lib/courses/adminCourseApi';

type PageProps = { searchParams: Promise<{ query?: string; status?: string; page?: string }> };

export default async function AdminCoursesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.query?.trim().slice(0, 120) ?? '';
  const status: '' | ManagedCourseStatusDto =
    params.status === 'draft' || params.status === 'published' ? params.status : '';
  const requestedPage = Number(params.page ?? '1');
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const response = await getAdminCourses({ query, status, page });
  if (response.status === 401) redirect('/sign-in');
  const payload = (await response.json().catch(() => null)) as
    | ManagedCoursePageDto
    | { message?: string }
    | null;
  const pageData = response.ok && payload && 'items' in payload ? payload : undefined;
  const courses = pageData?.items ?? [];
  const errorPayload = payload && 'message' in payload ? payload : undefined;
  const errorMessage = response.ok
    ? undefined
    : errorPayload?.message
      ? errorPayload.message
      : 'Não foi possível carregar os cursos agora.';

  return (
    <AdminCourseCatalog
      courses={courses}
      pageData={pageData}
      query={query}
      status={status}
      errorMessage={errorMessage}
    />
  );
}
