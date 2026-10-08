import { notFound, redirect } from 'next/navigation';
import type { AdminEnrollmentOptionsDto, AdminEnrollmentPageDto } from '@traderlab/contracts';
import { AdminEnrollmentCatalog } from '../../../components/ui/AdminEnrollmentCatalog';
import { getAdminEnrollmentOptions, getAdminEnrollments } from '../../../lib/enrollments/adminEnrollmentApi';
import { safeAdminReturnTo } from '../../../lib/navigation/safeAdminReturnTo';

type PageProps = { searchParams: Promise<{ query?: string; courseId?: string; status?: string; page?: string; returnTo?: string }> };

export default async function AdminEnrollmentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.query?.trim().slice(0, 120) ?? '';
  const parsedCourseId = Number(params.courseId);
  const courseId = Number.isSafeInteger(parsedCourseId) && parsedCourseId > 0 ? parsedCourseId : undefined;
  const status = params.status === 'active' || params.status === 'revoked' ? params.status : '';
  const parsedPage = Number(params.page ?? '1');
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const fallbackHref = params.returnTo ? (courseId ? `/enrollments?courseId=${courseId}` : '/enrollments') : courseId ? `/courses/${courseId}` : '/';
  const returnTo = safeAdminReturnTo(params.returnTo, fallbackHref);
  const [response, optionsResponse] = await Promise.all([
    getAdminEnrollments({ query, courseId, status, page }),
    getAdminEnrollmentOptions(),
  ]);
  if (response.status === 401 || optionsResponse.status === 401) redirect('/sign-in');
  if (response.status === 403 || optionsResponse.status === 403) notFound();
  const payload = await response.json().catch(() => null) as AdminEnrollmentPageDto | { message?: string } | null;
  const optionPayload = await optionsResponse.json().catch(() => null) as AdminEnrollmentOptionsDto | { message?: string } | null;
  const pageData = response.ok && payload && 'items' in payload ? payload : undefined;
  const courses = optionsResponse.ok && optionPayload && 'courses' in optionPayload ? optionPayload.courses : [];
  const errorMessage = response.ok ? undefined : payload && 'message' in payload && payload.message
    ? payload.message : 'Não foi possível carregar as matrículas agora.';
  return <AdminEnrollmentCatalog pageData={pageData} courses={courses} query={query} courseId={courseId} status={status} returnTo={returnTo} errorMessage={errorMessage} />;
}
