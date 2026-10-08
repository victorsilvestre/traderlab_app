import { notFound, redirect } from 'next/navigation';
import type {
  ManagedCourseModulesDto,
  ManagedLessonDto,
} from '@traderlab/contracts';
import { AdminLessonForm } from '../../../../../../../../components/forms/AdminLessonForm';
import {
  getAdminCourseModules,
  getAdminLesson,
} from '../../../../../../../../lib/courses/adminCourseApi';
import { AdminBackLink } from '../../../../../../../../components/navigation/AdminBackLink';
import styles from '../../../../../editor.module.css';
import { safeAdminReturnTo } from '../../../../../../../../lib/navigation/safeAdminReturnTo';

type PageProps = {
  params: Promise<{ courseId: string; moduleId: string; contentId: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function EditAdminLessonPage({ params, searchParams }: PageProps) {
  const [route, query] = await Promise.all([params, searchParams]);
  const {
    courseId: rawCourseId,
    moduleId: rawModuleId,
    contentId: rawContentId,
  } = route;
  const courseId = Number(rawCourseId);
  const moduleId = Number(rawModuleId);
  const contentId = Number(rawContentId);
  if (
    ![courseId, moduleId, contentId].every(
      (id) => Number.isSafeInteger(id) && id > 0,
    )
  )
    notFound();
  const returnTo = safeAdminReturnTo(query.returnTo, `/courses/${courseId}`);
  const [modulesResponse, lessonResponse] = await Promise.all([
    getAdminCourseModules(courseId),
    getAdminLesson(courseId, moduleId, contentId),
  ]);
  if (modulesResponse.status === 401 || lessonResponse.status === 401)
    redirect('/sign-in');
  if (modulesResponse.status === 404 || lessonResponse.status === 404)
    notFound();
  const [modules, lesson] = await Promise.all([
    modulesResponse.json().catch(() => null) as Promise<
      ManagedCourseModulesDto | { message?: string } | null
    >,
    lessonResponse.json().catch(() => null) as Promise<
      ManagedLessonDto | { message?: string } | null
    >,
  ]);
  if (
    !modulesResponse.ok ||
    !modules ||
    !('course' in modules) ||
    !modules.items.some((item) => item.id === moduleId)
  ) {
    return (
      <section className={styles.editor} role="alert">
        <AdminBackLink href={returnTo} />
        <h1>Não foi possível abrir o curso</h1>
        <p>
          {modules && 'message' in modules
            ? modules.message
            : 'Tente novamente em instantes.'}
        </p>
      </section>
    );
  }
  if (!lessonResponse.ok || !lesson || !('id' in lesson)) notFound();
  return (
    <section className={styles.editor}>
      <AdminBackLink href={returnTo} />
      <h1>Editar aula</h1>
      <p>
        Atualize o conteúdo e os materiais complementares. Ao salvar, a aula
        será publicada.
      </p>
      <div className={styles.status}>
        Estado atual: {lesson.status === 'published' ? 'Publicado' : 'Rascunho'}
      </div>
      <AdminLessonForm
        courseId={courseId}
        moduleId={moduleId}
        lesson={lesson}
        returnTo={returnTo}
      />
    </section>
  );
}
