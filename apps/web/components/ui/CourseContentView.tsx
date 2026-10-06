import Link from 'next/link';
import type {
  CourseContentDto,
  CourseDetailDto,
  UserProfileDto,
} from '@traderlab/contracts';
import { CourseBreadcrumbs } from '../navigation/CourseBreadcrumbs';
import { StudentHeader } from './StudentHeader';
import { CourseCompletionButton } from './CourseCompletionButton';
import { CourseCurriculum } from './CourseCurriculum';
import { RichTextRenderer } from './RichTextRenderer';
import { RetryPageButton } from './RetryPageButton';
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
          <h1>Não conseguimos carregar esta aula.</h1>
          <p>Atualize a página para tentar novamente.</p>
          <RetryPageButton />
          <Link className={styles.resumeLink} href="/home">
            Voltar ao início
          </Link>
        </section>
      </div>
    </main>
  );
}

export function StudentSessionUnavailable({
  returnTo,
}: {
  returnTo: string;
}) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.errorState} role="alert">
          <h1>Não foi possível verificar sua sessão agora.</h1>
          <p>Tente novamente em instantes. Seus dados de acesso foram mantidos.</p>
          <RetryPageButton />
          <Link className={styles.backLink} href={`/sign-in?next=${encodeURIComponent(returnTo)}`}>
            Entrar novamente
          </Link>
        </section>
      </div>
    </main>
  );
}

function youtubeVideoId(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let id: string | null = null;
    if (host === 'youtu.be') {
      id = url.pathname.split('/').filter(Boolean)[0] ?? null;
    } else if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname === '/watch') id = url.searchParams.get('v');
      else if (url.pathname.startsWith('/embed/')) {
        id = url.pathname.split('/')[2] ?? null;
      }
    }
    if (url.searchParams.has('list') || !id || !/^[A-Za-z0-9_-]{11}$/.test(id)) {
      return null;
    }
    return id;
  } catch {
    return null;
  }
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

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CourseContentView({
  profile,
  content,
  course,
}: {
  profile: UserProfileDto;
  content: CourseContentDto;
  course: CourseDetailDto;
}) {
  const videoId = content.kind === 'lesson' ? youtubeVideoId(content.videoUrl) : null;
  const legacyMaterialUrl =
    content.kind === 'material' ? safeExternalUrl(content.resourceUrl) : null;

  return (
    <main className={styles.page}>
      <StudentHeader name={profile.name} />
      <div className={styles.container}>
        <CourseBreadcrumbs
          courseId={content.courseId}
          courseTitle={content.courseTitle}
          currentTitle={content.title}
        />
        <header className={styles.lessonHeading}>
          <Link className={styles.lessonBackLink} href={`/courses/${encodeURIComponent(content.courseId)}`}>
            ← Voltar
          </Link>
          <h1>{content.title}</h1>
          {content.description && <p>{content.description}</p>}
        </header>

        <div className={styles.lessonLayout}>
          <article className={styles.lessonMain}>
            {content.kind === 'lesson' && (
              <section aria-label="Vídeo da aula">
                {videoId ? (
                  <div className={styles.lessonVideo}>
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                      title={`Vídeo da aula: ${content.title}`}
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className={styles.videoUnavailable} role="status">
                    <strong>Vídeo indisponível</strong>
                    <span>O vídeo desta aula ainda não foi configurado.</span>
                  </div>
                )}
              </section>
            )}

            <section className={styles.lessonSection} aria-labelledby="lesson-body-title">
              <h2 id="lesson-body-title">Sobre esta aula</h2>
              {content.body.children.length ? (
                <div className={styles.richText}>
                  <RichTextRenderer document={content.body} />
                </div>
              ) : (
                <p className={styles.mutedText}>Ainda não há conteúdo complementar nesta aula.</p>
              )}
              {legacyMaterialUrl && (
                <a
                  className={styles.externalVideoLink}
                  href={legacyMaterialUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir material em outra página ↗
                </a>
              )}
            </section>

            <section className={styles.lessonSection} aria-labelledby="materials-title">
              <h2 id="materials-title">Materiais de apoio</h2>
              {content.materials.length ? (
                <ul className={styles.materialList}>
                  {content.materials.map((material) => (
                    <li className={styles.materialItem} key={material.id}>
                      <span className={styles.materialFileIcon} aria-hidden="true">
                        {material.name.split('.').pop()?.toUpperCase().slice(0, 4) ?? 'FILE'}
                      </span>
                      <span className={styles.materialDetails}>
                        <strong>{material.name}</strong>
                        <small>
                          {material.mimeType} · {formatBytes(material.sizeBytes)}
                        </small>
                      </span>
                      <a
                        className={styles.materialDownload}
                        href={`/courses/${encodeURIComponent(content.courseId)}/contents/${encodeURIComponent(content.id)}/materials/${encodeURIComponent(material.id)}/download`}
                      >
                        Baixar
                        <span className={styles.srOnly}> {material.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.mutedText}>Esta aula não possui materiais de apoio.</p>
              )}
            </section>

            <div className={styles.completionRow}>
              <span>Seu progresso é salvo na sua conta.</span>
              <CourseCompletionButton
                courseId={content.courseId}
                contentId={content.id}
                completed={content.completed}
              />
            </div>
          </article>

          <CourseCurriculum course={course} currentContentId={content.id} />
        </div>
      </div>
    </main>
  );
}
