import { notFound, redirect } from 'next/navigation';
import type { ManagedCourseModulesDto } from '@traderlab/contracts';
import { AdminModuleForm } from '../../../../../../components/forms/AdminModuleForm';
import { AdminBackLink } from '../../../../../../components/navigation/AdminBackLink';
import { getAdminCourseModules } from '../../../../../../lib/courses/adminCourseApi';
import styles from '../../../editor.module.css';
import { safeAdminReturnTo } from '../../../../../../lib/navigation/safeAdminReturnTo';

type PageProps = { params: Promise<{ courseId: string; moduleId: string }>; searchParams: Promise<{ returnTo?: string }> };

export default async function EditAdminModulePage({ params, searchParams }: PageProps) {
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
  if (
    !response.ok ||
    !payload ||
    !('course' in payload) ||
    !('items' in payload)
  ) {
    return (
      <section className={styles.editor} role="alert">
        <AdminBackLink href={returnTo} />
        <h1>Não foi possível abrir os módulos</h1>
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
      <h1>Editar módulo</h1>
      <p>
        Atualize os dados de <strong>{selectedModule.title}</strong>. Ao salvar,
        o módulo será publicado.
      </p>
      <div className={styles.status}>
        Estado atual:{' '}
        {selectedModule.status === 'published' ? 'Publicado' : 'Rascunho'}
      </div>
      <AdminModuleForm courseId={courseId} module={selectedModule} returnTo={returnTo} />
    </section>
  );
}
