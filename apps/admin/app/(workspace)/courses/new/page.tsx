import Link from 'next/link';
import { AdminCourseForm } from '../../../../components/forms/AdminCourseForm';
import styles from '../editor.module.css';

export default function NewAdminCoursePage() {
  return (
    <section className={styles.editor}>
      <Link className={styles.backLink} href="/courses">← Cursos</Link>
      <h1>Novo curso</h1>
      <p>Defina as informações principais. O curso começa como rascunho.</p>
      <AdminCourseForm />
    </section>
  );
}
