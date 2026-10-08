import { AdminCourseForm } from '../../../../components/forms/AdminCourseForm';
import { AdminBackLink } from '../../../../components/navigation/AdminBackLink';
import styles from '../editor.module.css';
import { safeAdminReturnTo } from '../../../../lib/navigation/safeAdminReturnTo';

type PageProps = { searchParams: Promise<{ returnTo?: string }> };

export default async function NewAdminCoursePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const returnTo = safeAdminReturnTo(params.returnTo, '/courses');
  return (
    <section className={styles.editor}>
      <AdminBackLink href={returnTo} />
      <h1>Novo curso</h1>
      <p>Defina as informações. O curso será publicado ao salvar.</p>
      <AdminCourseForm returnTo={returnTo} />
    </section>
  );
}
