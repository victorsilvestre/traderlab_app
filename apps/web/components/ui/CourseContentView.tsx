import Link from 'next/link';
import type { CourseContentDto, UserProfileDto } from '@traderlab/contracts';
import { CourseBreadcrumbs } from '../navigation/CourseBreadcrumbs';
import { StudentHeader } from './StudentHeader';
import { CourseCompletionButton } from './CourseCompletionButton';
import styles from './CourseScreen.module.css';

export function CourseContentLoadError({
  profile,
}: {
  profile: UserProfileDto;
}) {
  return (
    <main className={styles.page}>
      <StudentHeader name={profile.name} />
      <div className={styles.container}>
        <section className={styles.errorState} role="alert">
          <h1>Não conseguimos carregar este conteúdo.</h1>
          <p>
            Atualize a página para tentar novamente. Seu progresso está
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

function safeExternalUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function CourseContentView({
  profile,
  content,
}: {
  profile: UserProfileDto;
  content: CourseContentDto;
}) {
  const resourceUrl = safeExternalUrl(content.resourceUrl);

  return (
    <main className={styles.page}>
      <StudentHeader name={profile.name} />
      <div className={styles.container}>
        <CourseBreadcrumbs
          courseId={content.courseId}
          courseTitle={content.courseTitle}
          currentTitle={content.title}
        />
        <article className={styles.contentPage}>
          <Link
            className={styles.backLink}
            href={`/courses/${encodeURIComponent(content.courseId)}`}
          >
            Voltar ao curso
          </Link>
          <div className={styles.contentArticle}>
            <span className={styles.contentMeta}>
              {content.moduleTitle} ·{' '}
              {content.kind === 'material' ? 'Material' : 'Aula'}
            </span>
            <h1>{content.title}</h1>
            {content.description && <p>{content.description}</p>}
            {content.body && <p>{content.body}</p>}
            {resourceUrl && (
              <a
                className={styles.resourceLink}
                href={resourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir recurso em outra página
              </a>
            )}
            <div className={styles.completionRow}>
              <span>Seu progresso é salvo na sua conta.</span>
              <CourseCompletionButton
                courseId={content.courseId}
                contentId={content.id}
                completed={content.completed}
              />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
