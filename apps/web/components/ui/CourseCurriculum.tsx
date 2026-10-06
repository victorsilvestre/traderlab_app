import Link from 'next/link';
import type { CourseDetailDto } from '@traderlab/contracts';
import styles from './CourseScreen.module.css';

export function CourseCurriculum({
  course,
  currentContentId,
}: {
  course: CourseDetailDto;
  currentContentId: number;
}) {
  const visibleModules = course.modules.filter((module) =>
    module.contents.some((content) => content.kind === 'lesson'),
  );
  const lessonCount = course.modules.reduce(
    (total, module) =>
      total + module.contents.filter((content) => content.kind === 'lesson').length,
    0,
  );
  const completedLessonCount = course.modules.reduce(
    (total, module) =>
      total + module.contents.filter(
        (content) => content.kind === 'lesson' && content.completed,
      ).length,
    0,
  );
  return (
    <details className={styles.curriculum} open>
      <summary className={styles.curriculumToggle}>
        Conteúdo do curso
        <span aria-hidden="true">⌄</span>
      </summary>
      <div className={styles.curriculumHeading}>
        <h2>Conteúdo do curso</h2>
        <p>
          {visibleModules.length} módulos · {lessonCount} aulas · {completedLessonCount} concluídas
        </p>
      </div>
      <div className={styles.curriculumContent}>
        {visibleModules.map((module) => {
          const lessons = module.contents.filter(
            (content) => content.kind === 'lesson',
          );
          if (!lessons.length) return null;
          const completedCount = lessons.filter((lesson) => lesson.completed).length;
          return (
            <details
              className={styles.curriculumModule}
              key={module.id}
              open={lessons.some((lesson) => lesson.id === currentContentId)}
            >
              <summary className={styles.curriculumModuleTitle}>
                <span>{module.title}</span>
                <small>
                  {completedCount}/{lessons.length}
                </small>
              </summary>
              <ul className={styles.curriculumLessons}>
                {lessons.map((lesson) => {
                  const isCurrent = lesson.id === currentContentId;
                  return (
                    <li key={lesson.id}>
                      <Link
                        className={styles.curriculumLesson}
                        href={`/courses/${encodeURIComponent(course.id)}/contents/${encodeURIComponent(lesson.id)}`}
                        aria-current={isCurrent ? 'page' : undefined}
                      >
                        <span
                          className={styles.curriculumLessonState}
                          aria-label={
                            lesson.completed ? 'Aula concluída' : 'Aula não concluída'
                          }
                        >
                          {lesson.completed ? '✓' : isCurrent ? '▶' : ''}
                        </span>
                        <span className={styles.curriculumLessonName}>
                          {lesson.title}
                          {isCurrent && <small>Aula atual</small>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </details>
  );
}
