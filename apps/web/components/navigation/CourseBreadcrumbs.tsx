import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
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
      <ol className={styles.breadcrumbList}>
        <li className={styles.breadcrumbItem}>
          <Link href="/home">Início</Link>
        </li>
        <li className={styles.breadcrumbItem}>
          <span className={styles.breadcrumbSeparator} aria-hidden="true"><ChevronRight size={14} strokeWidth={1.7} /></span>
          <Link href="/courses">Meus cursos</Link>
        </li>
        <li className={styles.breadcrumbItem}>
          <span className={styles.breadcrumbSeparator} aria-hidden="true"><ChevronRight size={14} strokeWidth={1.7} /></span>
          {currentTitle ? (
            <Link href={`/courses/${encodeURIComponent(courseId)}`}>
              {courseTitle}
            </Link>
          ) : (
            <span className={styles.breadcrumbCurrent} aria-current="page" aria-label={courseTitle} title={courseTitle}>{courseTitle}</span>
          )}
        </li>
        {currentTitle && (
          <li className={styles.breadcrumbItem}>
            <span className={styles.breadcrumbSeparator} aria-hidden="true"><ChevronRight size={14} strokeWidth={1.7} /></span>
            <span className={styles.breadcrumbCurrent} aria-current="page" aria-label={currentTitle} title={currentTitle}>{currentTitle}</span>
          </li>
        )}
      </ol>
    </nav>
  );
}
