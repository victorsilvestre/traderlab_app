import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BookOpen } from 'lucide-react';
import type { CourseSummaryDto } from '@traderlab/contracts';
import { CourseImage } from './CourseImage';
import { homeClass } from './homeStyles';
import { isManagedCourseImageUrl } from '../../lib/images/isManagedCourseImageUrl';

export function StudentCourseLibrary({
  courses,
  unavailable,
}: {
  courses: CourseSummaryDto[];
  unavailable: boolean;
}) {
  return (
    <main className={homeClass('student-home')}>
      <div className={homeClass('student-content')}>
        <section className={homeClass('course-library')} aria-labelledby="course-library-title">
          <Link className={homeClass('search-back')} href="/home"><ArrowLeft aria-hidden="true" size={15} /> Voltar à home</Link>
          <div className={homeClass('course-library-heading')}>
            <div>
              <h1 id="course-library-title">Meus cursos</h1>
              <p>Todos os cursos disponíveis para sua conta, em um só lugar.</p>
            </div>
            {!unavailable && <span className={homeClass('course-library-count')}>{courses.length} {courses.length === 1 ? 'curso' : 'cursos'}</span>}
          </div>

          {unavailable ? (
            <div className={homeClass('course-library-state')} role="alert">
              <BookOpen size={24} aria-hidden="true" />
              <h2>Não conseguimos carregar seus cursos agora.</h2>
              <p>Atualize esta página para tentar novamente.</p>
            </div>
          ) : courses.length === 0 ? (
            <div className={homeClass('course-library-state')} role="status">
              <BookOpen size={24} aria-hidden="true" />
              <h2>Você ainda não tem cursos por aqui</h2>
              <p>Quando um curso for liberado para sua conta, ele aparecerá nesta página.</p>
            </div>
          ) : (
            <div className={homeClass('course-library-grid')}>
              {courses.map((course) => {
                const isManagedImage = isManagedCourseImageUrl(course.coverImageUrl);
                return (
                  <article className={homeClass('course-library-card')} key={course.id}>
                    <Link
                      className={homeClass('course-library-image')}
                      href={`/courses/${encodeURIComponent(course.id)}`}
                      aria-label={`Abrir curso ${course.title}`}
                    >
                      {course.coverImageUrl ? (
                        isManagedImage ? (
                          <CourseImage
                            className={homeClass('course-library-cover')}
                            src={course.coverImageUrl}
                            alt={`Capa do curso ${course.title}`}
                            sizes="(max-width: 560px) calc(100vw - 56px), (max-width: 900px) calc((100vw - 60px) / 2), (max-width: 1200px) calc((100vw - 210px) / 2), 360px"
                          />
                        ) : (
                          <span className={homeClass('course-library-cover')} role="img" aria-label={`Capa do curso ${course.title}`} style={{ backgroundImage: `url(${course.coverImageUrl})` }} />
                        )
                      ) : (
                        <span className={homeClass('course-library-placeholder')} aria-hidden="true"><BookOpen size={30} /></span>
                      )}
                      <span className={homeClass('course-library-open')} aria-hidden="true"><ArrowUpRight size={19} /></span>
                    </Link>
                    <div className={homeClass('course-library-copy')}>
                      <h2><Link href={`/courses/${encodeURIComponent(course.id)}`}>{course.title}</Link></h2>
                      <p>{course.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
