import { notFound, redirect } from 'next/navigation';
import type { ManagedCourseModulesDto } from '@traderlab/contracts';
import { AdminLessonForm } from '../../../../../../../../components/forms/AdminLessonForm';
import { AdminBackLink } from '../../../../../../../../components/navigation/AdminBackLink';
import { getAdminCourseModules } from '../../../../../../../../lib/courses/adminCourseApi';
import styles from '../../../../../editor.module.css';
import { safeAdminReturnTo } from '../../../../../../../../lib/navigation/safeAdminReturnTo';

type PageProps = { params: Promise<{ courseId: string; moduleId: string }>; searchParams: Promise<{ returnTo?: string }> };

export default async function NewAdminLessonPage({ params, searchParams }: PageProps) {
  const [{ courseId: rawCourseId, moduleId: rawModuleId }, query] = await Promise.all([params, searchParams]);
  const courseId = Number(rawCourseId);
  const moduleId = Number(rawModuleId);
  if (
    !Number.isSafeInteger(courseId) ||
    courseId < 1 ||
    !Number.isSafeInteger(moduleId) ||
    moduleId < 1
  )
    notFound();
  const returnTo = safeAdminReturnTo(query.returnTo, `/courses/${courseId}`);
  const response = await getAdminCourseModules(courseId);
  if (response.status === 401) redirect('/sign-in');
  if (response.status === 404) notFound();
  const payload = (await response.json().catch(() => null)) as
    ManagedCourseModulesDto | { message?: string } | null;
  if (!response.ok || !payload || !('course' in payload)) {
    return (
      <section className={styles.editor} role="alert">
        <AdminBackLink href={returnTo} />
        <h1>Não foi possível abrir o curso</h1>
        <p>
          {payload && 'message' in payload
            ? payload.message
            : 'Tente novamente em instantes.'}
        </p>
      </section>
    );
  }
  const selectedModule = payload.items.find((item) => item.id === moduleId);
  if (!selectedModule) notFound();
  return (
    <section className={styles.editor}>
      <AdminBackLink href={returnTo} />
      <h1>Nova aula</h1>
      <p>
        Adicione conteúdo ao módulo <strong>{selectedModule.title}</strong>. A
        aula será publicada ao salvar.
      </p>
      <AdminLessonForm courseId={courseId} moduleId={moduleId} returnTo={returnTo} />
    </section>
  );
}
