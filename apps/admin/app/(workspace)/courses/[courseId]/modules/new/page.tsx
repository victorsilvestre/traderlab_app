import { notFound, redirect } from 'next/navigation';
import type { ManagedCourseModulesDto } from '@traderlab/contracts';
import { AdminModuleForm } from '../../../../../../components/forms/AdminModuleForm';
import { AdminBackLink } from '../../../../../../components/navigation/AdminBackLink';
import { getAdminCourseModules } from '../../../../../../lib/courses/adminCourseApi';
import styles from '../../../editor.module.css';
import { safeAdminReturnTo } from '../../../../../../lib/navigation/safeAdminReturnTo';

type PageProps = { params: Promise<{ courseId: string }>; searchParams: Promise<{ returnTo?: string }> };

export default async function NewAdminModulePage({ params, searchParams }: PageProps) {
  const [{ courseId: rawId }, query] = await Promise.all([params, searchParams]);
  const courseId = Number(rawId);
  if (!Number.isSafeInteger(courseId) || courseId < 1) notFound();
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
        <h1>Não foi possível abrir este curso</h1>
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
      <h1>Novo módulo</h1>
      <p>Defina as informações. O módulo será publicado ao salvar.</p>
      <AdminModuleForm courseId={courseId} returnTo={returnTo} />
    </section>
  );
}
