import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { ManagedCourseModulesDto } from '@traderlab/contracts';
import { AdminModuleForm } from '../../../../../../components/forms/AdminModuleForm';
import { getAdminCourseModules } from '../../../../../../lib/courses/adminCourseApi';
import styles from '../../../editor.module.css';

type PageProps = { params: Promise<{ courseId: string; moduleId: string }> };

export default async function EditAdminModulePage({ params }: PageProps) {
  const { courseId: rawCourseId, moduleId: rawModuleId } = await params;
  const courseId = Number(rawCourseId);
  const moduleId = Number(rawModuleId);
  if (
    !Number.isSafeInteger(courseId) ||
    courseId < 1 ||
    !Number.isSafeInteger(moduleId) ||
    moduleId < 1
  )
    notFound();
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
        <Link className={styles.backLink} href={`/courses/${courseId}`}>
          ← Conteúdo do curso
        </Link>
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
      <Link className={styles.backLink} href={`/courses/${courseId}`}>
        ← {payload.course.title}
      </Link>
      <h1>Editar módulo</h1>
      <p>
        Atualize os dados de <strong>{selectedModule.title}</strong>.
      </p>
      <div className={styles.status}>
        Estado atual:{' '}
        {selectedModule.status === 'published' ? 'Publicado' : 'Rascunho'}
      </div>
      <AdminModuleForm courseId={courseId} module={selectedModule} />
    </section>
  );
}
