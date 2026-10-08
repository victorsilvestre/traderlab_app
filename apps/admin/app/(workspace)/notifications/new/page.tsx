import { notFound, redirect } from 'next/navigation';
import type { ManagedNotificationCourseDto } from '@traderlab/contracts';
import { AdminNotificationForm } from '../../../../components/forms/AdminNotificationForm';
import { AdminBackLink } from '../../../../components/navigation/AdminBackLink';
import styles from '../../courses/editor.module.css';
import { getAdminNotificationCourses } from '../../../../lib/notifications/adminNotificationApi';
import { safeAdminReturnTo } from '../../../../lib/navigation/safeAdminReturnTo';

type PageProps = { searchParams: Promise<{ returnTo?: string }> };

export default async function NewAdminNotificationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const returnTo = safeAdminReturnTo(params.returnTo, '/notifications');
  const response = await getAdminNotificationCourses();
  if (response.status === 401) redirect('/sign-in');
  if (response.status === 403) notFound();
  const payload = (await response.json().catch(() => null)) as
    | { items: ManagedNotificationCourseDto[] }
    | { message?: string }
    | null;
  const courses = response.ok && payload && 'items' in payload ? payload.items : [];
  const errorMessage = response.ok
    ? undefined
    : payload && 'message' in payload && payload.message
      ? payload.message
      : 'Não foi possível carregar os cursos.';
  return (
    <section className={styles.editor}>
      <AdminBackLink href={returnTo} />
      <h1>Nova notificação</h1>
      <p>Defina o público e a mensagem. O disparo será imediato.</p>
      <AdminNotificationForm courses={courses} returnTo={returnTo} initialError={errorMessage} />
    </section>
  );
}
