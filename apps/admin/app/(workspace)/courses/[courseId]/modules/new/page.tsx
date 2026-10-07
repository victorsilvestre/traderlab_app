import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { ManagedCourseModulesDto } from '@traderlab/contracts';
import { AdminModuleForm } from '../../../../../../components/forms/AdminModuleForm';
import { getAdminCourseModules } from '../../../../../../lib/courses/adminCourseApi';
import styles from '../../../editor.module.css';

type PageProps = { params: Promise<{ courseId: string }> };

export default async function NewAdminModulePage({ params }: PageProps) {
  const { courseId: rawId } = await params;
  const courseId = Number(rawId);
  if (!Number.isSafeInteger(courseId) || courseId < 1) notFound();
  const response = await getAdminCourseModules(courseId);
  if (response.status === 401) redirect('/sign-in');
  if (response.status === 404) notFound();
  const payload = (await response.json().catch(() => null)) as
    ManagedCourseModulesDto | { message?: string } | null;
  if (!response.ok || !payload || !('course' in payload)) {
    return (
      <section className={styles.editor} role="alert">
        <Link className={styles.backLink} href={`/courses/${courseId}`}>
          ← Conteúdo do curso
        </Link>
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
      <Link className={styles.backLink} href={`/courses/${courseId}`}>
        ← {payload.course.title}
      </Link>
      <h1>Novo módulo</h1>
      <p>Defina as informações. O módulo começa como rascunho.</p>
      <AdminModuleForm courseId={courseId} />
    </section>
  );
}
