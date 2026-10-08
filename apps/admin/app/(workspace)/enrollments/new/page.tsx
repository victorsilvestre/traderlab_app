import { notFound, redirect } from 'next/navigation';
import type { AdminEnrollmentOptionsDto } from '@traderlab/contracts';
import { AdminEnrollmentForm } from '../../../../components/forms/AdminEnrollmentForm';
import { AdminBackLink } from '../../../../components/navigation/AdminBackLink';
import styles from '../../courses/editor.module.css';
import { getAdminEnrollmentOptions } from '../../../../lib/enrollments/adminEnrollmentApi';
import { safeAdminReturnTo } from '../../../../lib/navigation/safeAdminReturnTo';

type PageProps = { searchParams: Promise<{ courseId?: string; userId?: string; returnTo?: string }> };

export default async function NewAdminEnrollmentPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const parsedCourseId = Number(params.courseId);
  const courseId = Number.isSafeInteger(parsedCourseId) && parsedCourseId > 0 ? parsedCourseId : undefined;
  const userId = params.userId;
  const response = await getAdminEnrollmentOptions('', userId);
  if (response.status === 401) redirect('/sign-in');
  if (response.status === 403) notFound();
  const payload = await response.json().catch(() => null) as AdminEnrollmentOptionsDto | { message?: string } | null;
  const data = response.ok && payload && 'users' in payload ? payload : undefined;
  const errorMessage = response.ok ? undefined : payload && 'message' in payload && payload.message
    ? payload.message : 'Não foi possível carregar as opções de matrícula.';
  const fallbackHref = userId ? `/users/${encodeURIComponent(userId)}` : courseId ? `/courses/${courseId}` : '/enrollments';
  const returnHref = safeAdminReturnTo(params.returnTo, params.returnTo ? '/enrollments' : fallbackHref);
  return (
    <section className={styles.editor}>
      <AdminBackLink href={returnHref} />
      <h1>Nova matrícula</h1>
      <p>Selecione um usuário cadastrado e um curso publicado. O acesso será liberado imediatamente.</p>
      <AdminEnrollmentForm options={data} initialCourseId={courseId} initialUserId={userId} returnTo={returnHref} initialError={errorMessage} />
    </section>
  );
}
