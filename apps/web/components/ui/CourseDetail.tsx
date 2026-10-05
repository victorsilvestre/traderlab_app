import Link from 'next/link';
import type {
  CourseDetailDto,
  UserProfileDto,
} from '@traderlab/contracts';
import { CourseBreadcrumbs } from '../navigation/CourseBreadcrumbs';
import { CourseModuleExplorer } from './CourseModuleExplorer';
import { StudentHeader } from './StudentHeader';
import styles from './CourseScreen.module.css';

export function CourseDetail({
  profile,
  course,
}: {
  profile: UserProfileDto;
  course: CourseDetailDto;
}) {
  const resumeContent = course.lastAccessedContent;

  return (
    <main className={styles.page}>
      <StudentHeader name={profile.name} />
      <div className={styles.container}>
        <CourseBreadcrumbs courseId={course.id} courseTitle={course.title} />
        <section className={styles.courseHero} aria-labelledby="course-title">
          <div
            className={styles.courseCover}
            role={course.coverImageUrl ? 'img' : undefined}
            aria-label={
              course.coverImageUrl ? `Capa do curso ${course.title}` : undefined
            }
            style={
              course.coverImageUrl
                ? { backgroundImage: `url(${course.coverImageUrl})` }
                : undefined
            }
          >
            {!course.coverImageUrl && <span aria-hidden="true">T</span>}
          </div>
          <div className={styles.courseIntro}>
            <h1 id="course-title">{course.title}</h1>
            <p>{course.description}</p>
            <div className={styles.courseStats}>
              <div>
                <strong>{course.contentCount}</strong>
                <span>conteúdos</span>
              </div>
              <div>
                <strong>{course.completedCount}</strong>
                <span>concluídos</span>
              </div>
              <div>
                <strong>{course.progressPercent}%</strong>
                <span>do curso</span>
              </div>
            </div>
            <div
              className={styles.courseProgress}
              aria-label={`Progresso: ${course.progressPercent}%`}
            >
              <span>
                <span style={{ width: `${course.progressPercent}%` }} />
              </span>
            </div>
          </div>
        </section>

        <section
          className={styles.resumeSection}
          aria-labelledby="resume-title"
        >
          {resumeContent ? (
            <>
              <div className={styles.resumeCopy}>
                <span className={styles.resumeLabel}>Seu último conteúdo</span>
                <h2 id="resume-title">{resumeContent.title}</h2>
                <p>
                  {resumeContent.description ||
                    'Continue de onde você parou neste curso.'}
                </p>
              </div>
              <Link
                className={styles.resumeLink}
                href={`/courses/${encodeURIComponent(course.id)}/contents/${encodeURIComponent(resumeContent.id)}`}
              >
                Retomar estudos <span aria-hidden="true">↗</span>
              </Link>
            </>
          ) : (
            <div className={styles.resumeEmpty}>
              <span className={styles.resumeLabel}>Retomar estudos</span>
              <h2 id="resume-title">Seu primeiro passo começa aqui.</h2>
              <p>
                Quando você acessar um conteúdo, poderá continuar por esta
                seção.
              </p>
            </div>
          )}
        </section>

        <CourseModuleExplorer
          courseId={course.id}
          modules={course.modules}
        />
      </div>
    </main>
  );
}

export function CourseLoadError({ profile }: { profile: UserProfileDto }) {
  return (
    <main className={styles.page}>
      <StudentHeader name={profile.name} />
      <div className={styles.container}>
        <Link href="/home" className={styles.backLink}>
          ← Voltar ao início
        </Link>
        <section className={styles.errorState} role="alert">
          <h1>Não conseguimos carregar este curso.</h1>
          <p>
            Atualize a página para tentar novamente. Seu acesso continua
            protegido.
          </p>
          <Link className={styles.resumeLink} href="/home">
            Voltar ao início
          </Link>
        </section>
      </div>
    </main>
  );
}

export function CourseUnavailableState() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link className={styles.unavailableBrand} href="/home">
          <span aria-hidden="true">T</span> TraderLab
        </Link>
        <section className={styles.errorState} role="status">
          <h1>Este curso ou conteúdo não está disponível para sua conta.</h1>
          <p>Volte à sua biblioteca para ver os cursos liberados para você.</p>
          <Link className={styles.resumeLink} href="/home">
            Ir para meus cursos
          </Link>
        </section>
      </div>
    </main>
  );
}
