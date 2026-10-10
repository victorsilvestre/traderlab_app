import Link from 'next/link';
import type { CourseSummaryDto } from '@traderlab/contracts';
import { homeClass } from './homeStyles';
import { EmptyState } from './EmptyState';
import { CourseImage } from './CourseImage';
import { ArrowUpRight } from 'lucide-react';

export function CourseList({
  courses,
  unavailable = false,
}: {
  courses: CourseSummaryDto[];
  unavailable?: boolean;
}) {
  return (
    <section
      id="courses-section"
      className={homeClass('learning-section', 'courses-section')}
      aria-labelledby="courses-title"
    >
      <div className={homeClass('section-heading')}>
        <div>
          <h2 id="courses-title">Meus Cursos</h2>
        </div>
        <span className={homeClass('section-count')}>
          {unavailable ? 'Indisponível' : `${courses.length} cursos`}
        </span>
      </div>
      {unavailable ? (
        <div className={homeClass('learning-empty')} role="status">
          <strong>Não conseguimos carregar seus cursos agora.</strong>
          <p>Atualize esta página para tentar novamente.</p>
        </div>
      ) : courses.length ? (
        <div className={homeClass('course-grid')}>
          {courses.map((course, index) => {
            const managedStorageImage = course.coverImageUrl?.includes(
              '/storage/v1/object/sign/traderlab-course-images/',
            );
            return (
              <article className={homeClass('course-tile')} key={course.id}>
                <Link
                  className={homeClass('course-art-button')}
                  href={`/courses/${encodeURIComponent(course.id)}`}
                  aria-label={`Abrir curso ${course.title}`}
                >
                  <span
                    className={homeClass('course-art')}
                    style={
                      !managedStorageImage && course.coverImageUrl
                        ? { backgroundImage: `url(${course.coverImageUrl})` }
                        : undefined
                    }
                  >
                    {managedStorageImage && course.coverImageUrl && (
                      <CourseImage
                        className={homeClass('course-art-image')}
                        src={course.coverImageUrl}
                        alt=""
                        sizes="(max-width: 420px) calc(100vw - 30px), (max-width: 560px) calc(100vw - 40px), (max-width: 760px) calc((100vw - 54px) / 2), 33vw"
                      />
                    )}
                  </span>
                  <span className={homeClass('course-number')}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={homeClass('course-open')} aria-hidden="true">
                    <ArrowUpRight size={17} strokeWidth={1.8} />
                  </span>
                </Link>
                <div className={homeClass('course-details')}>
                  <div className={homeClass('course-meta-row')}>
                    <span>
                      {course.completedCount} de {course.contentCount} concluídos
                    </span>
                  </div>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className={homeClass('course-progress-row')}>
                    <span
                      className={homeClass('progress-track')}
                      role="progressbar"
                      aria-label={`Progresso no curso ${course.title}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={course.progressPercent}
                    >
                      <span style={{ width: `${course.progressPercent}%` }} />
                    </span>
                    <small>{course.progressPercent}%</small>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          mark="⌑"
          title="Você ainda não tem cursos por aqui"
          description="Quando um curso for liberado para sua conta, ele aparecerá nesta seção."
        />
      )}
    </section>
  );
}
