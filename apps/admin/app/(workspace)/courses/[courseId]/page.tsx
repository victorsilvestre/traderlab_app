import { notFound, redirect } from 'next/navigation';
import type {
  ManagedCourseDto,
  ManagedCourseModulesDto,
} from '@traderlab/contracts';
import { AdminCourseModules } from '../../../../components/ui/AdminCourseModules';
import { AdminBackLink } from '../../../../components/navigation/AdminBackLink';
import {
  getAdminCourse,
  getAdminCourseModules,
} from '../../../../lib/courses/adminCourseApi';
import { getWorkspaceSession } from '../../../../lib/authentication/getWorkspaceSession';
import { safeAdminReturnTo } from '../../../../lib/navigation/safeAdminReturnTo';

type PageProps = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function AdminCourseBuilderPage({ params, searchParams }: PageProps) {
  const [{ courseId: rawCourseId }, query] = await Promise.all([params, searchParams]);
  const courseId = Number(rawCourseId);
  if (!Number.isSafeInteger(courseId) || courseId < 1) notFound();
  const returnTo = safeAdminReturnTo(query.returnTo, '/courses');

  const [courseResponse, modulesResponse] = await Promise.all([
    getAdminCourse(courseId),
    getAdminCourseModules(courseId),
  ]);
  if (courseResponse.status === 401 || modulesResponse.status === 401)
    redirect('/sign-in');

  const [coursePayload, modulesPayload] = await Promise.all([
    courseResponse.json().catch(() => null) as Promise<
      ManagedCourseDto | { message?: string } | null
    >,
    modulesResponse.json().catch(() => null) as Promise<
      ManagedCourseModulesDto | { message?: string } | null
    >,
  ]);

  const course =
    courseResponse.ok && coursePayload && 'id' in coursePayload
      ? coursePayload
      : null;
  const modules =
    modulesResponse.ok && modulesPayload && 'items' in modulesPayload
      ? modulesPayload
      : null;
  if (courseResponse.status === 404 || modulesResponse.status === 404)
    notFound();

  if (!course || !modules) {
    const message = !course
      ? coursePayload && 'message' in coursePayload
        ? coursePayload.message
        : 'Não foi possível carregar os dados do curso.'
      : modulesPayload && 'message' in modulesPayload
        ? modulesPayload.message
        : 'Não foi possível carregar os módulos.';
    return (
      <section role="alert">
        <AdminBackLink href={returnTo} />
        <h1>Não foi possível abrir o curso</h1>
        <p>{message}</p>
      </section>
    );
  }

  const session = await getWorkspaceSession();
  return <AdminCourseModules course={course} data={modules} isAdministrator={session.status === 'authorized' && session.profile.role === 'administrator'} returnTo={returnTo} />;
}
