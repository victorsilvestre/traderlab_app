import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { ManagedCourseDto } from '@traderlab/contracts';
import { AdminCourseForm } from '../../../../../components/forms/AdminCourseForm';
import { getAdminCourse } from '../../../../../lib/courses/adminCourseApi';
import styles from '../../editor.module.css';

type PageProps = { params: Promise<{ courseId: string }> };

export default async function AdminCourseSettingsPage({ params }: PageProps) {
  const { courseId: rawCourseId } = await params;
  const courseId = Number(rawCourseId);
  if (!Number.isSafeInteger(courseId) || courseId < 1) notFound();

  const response = await getAdminCourse(courseId);
  if (response.status === 401) redirect('/sign-in');
  const payload = (await response.json().catch(() => null)) as
    ManagedCourseDto | { message?: string } | null;
  if (response.status === 404) notFound();
  if (!response.ok || !payload || !('id' in payload)) {
    return (
      <section className={styles.editor} role="alert">
        <Link className={styles.backLink} href={`/courses/${courseId}`}>
          ← Voltar ao conteúdo do curso
        </Link>
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
      <Link className={styles.backLink} href={`/courses/${courseId}`}>
        ← {payload.title}
      </Link>
      <h1>Configurações do curso</h1>
      <p>Edite o nome, a descrição e a imagem de capa.</p>
      <div className={styles.status}>
        Estado atual:{' '}
        {payload.status === 'published' ? 'Publicado' : 'Rascunho'}
      </div>
      <AdminCourseForm course={payload} cancelHref={`/courses/${courseId}`} />
    </section>
  );
}
