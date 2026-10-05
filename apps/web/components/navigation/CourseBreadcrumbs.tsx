import Link from 'next/link';
import styles from '../ui/CourseScreen.module.css';

export function CourseBreadcrumbs({
  courseId,
  courseTitle,
  currentTitle,
}: {
  courseId: number;
  courseTitle: string;
  currentTitle?: string;
}) {
  return (
    <nav aria-label="Trilha de navegação" className={styles.breadcrumbs}>
      <ol>
        <li>
          <Link href="/home">Início</Link>
        </li>
        <li>
          <Link href="/home#courses-title">Meus cursos</Link>
        </li>
        <li>
          {currentTitle ? (
            <Link href={`/courses/${encodeURIComponent(courseId)}`}>
              {courseTitle}
            </Link>
          ) : (
            <span aria-current="page">{courseTitle}</span>
          )}
        </li>
        {currentTitle && <li aria-current="page">{currentTitle}</li>}
      </ol>
    </nav>
  );
}
