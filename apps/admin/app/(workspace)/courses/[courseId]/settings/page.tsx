import { notFound, redirect } from 'next/navigation';
import type { ManagedCourseDto } from '@traderlab/contracts';
import { AdminCourseForm } from '../../../../../components/forms/AdminCourseForm';
import { AdminBackLink } from '../../../../../components/navigation/AdminBackLink';
import { getAdminCourse } from '../../../../../lib/courses/adminCourseApi';
import { safeAdminReturnTo } from '../../../../../lib/navigation/safeAdminReturnTo';
import styles from '../../editor.module.css';

type PageProps = { params: Promise<{ courseId: string }>; searchParams: Promise<{ returnTo?: string }> };

export default async function AdminCourseSettingsPage({ params, searchParams }: PageProps) {
  const [{ courseId: rawCourseId }, query] = await Promise.all([params, searchParams]);
  const courseId = Number(rawCourseId);
  if (!Number.isSafeInteger(courseId) || courseId < 1) notFound();
  const returnTo = safeAdminReturnTo(query.returnTo, `/courses/${courseId}`);

  const response = await getAdminCourse(courseId);
  if (response.status === 401) redirect('/sign-in');
  const payload = (await response.json().catch(() => null)) as
    ManagedCourseDto | { message?: string } | null;
  if (response.status === 404) notFound();
  if (!response.ok || !payload || !('id' in payload)) {
    return (
      <section className={styles.editor} role="alert">
        <AdminBackLink href={returnTo} />
        <h1>Não foi possível abrir as configurações</h1>
        <p>
          {payload && 'message' in payload
            ? payload.message
            : 'Tente novamente em instantes.'}
        </p>
      </section>
    );
  }

  return (
    <section className={styles.editor}>
      <AdminBackLink href={returnTo} />
      <h1>Configurações do curso</h1>
      <p>
        Edite o nome, a descrição e a imagem de capa. Ao salvar, o curso será
        publicado.
      </p>
      <div className={styles.status}>
        Estado atual:{' '}
        {payload.status === 'published' ? 'Publicado' : 'Rascunho'}
      </div>
      <AdminCourseForm course={payload} returnTo={returnTo} />
    </section>
  );
}
