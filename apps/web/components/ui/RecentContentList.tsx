import Link from 'next/link';
import type { CourseSummaryDto, RecentContentDto } from '@traderlab/contracts';
import { homeClass } from './homeStyles';
import { EmptyState } from './EmptyState';
import { CourseImage } from './CourseImage';
import { Play } from 'lucide-react';

function formatAccessTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Acessado recentemente';

  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (elapsedMinutes < 1) return 'Acessado agora';
  if (elapsedMinutes < 60) return `Acessado há ${elapsedMinutes} min`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `Acessado há ${elapsedHours} h`;

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Acessado ontem';

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
  }).format(date);
  return `Acessado em ${formattedDate}`;
}

function countLabel(count: number): string {
  return `${count} ${count === 1 ? 'conteúdo' : 'conteúdos'}`;
}

export function RecentContentList({
  contents,
  unavailable = false,
  courses,
}: {
  contents: RecentContentDto[];
  unavailable?: boolean;
  courses: CourseSummaryDto[];
}) {
  return (
    <section
      id="continue-section"
      className={homeClass('learning-section')}
      aria-labelledby="continue-title"
    >
      <div className={homeClass('section-heading')}>
        <div>
          <h2 id="continue-title">Continue Onde Parou</h2>
        </div>
        <span className={homeClass('section-count')}>
          {unavailable ? 'Indisponível' : countLabel(contents.length)}
        </span>
      </div>

      {unavailable ? (
        <div className={homeClass('learning-empty')} role="status">
          <strong>Não conseguimos carregar seus conteúdos recentes agora.</strong>
          <p>Atualize esta página para tentar novamente.</p>
        </div>
      ) : contents.length ? (
        <div className={homeClass('recent-list')}>
          {contents.map((item) => {
            const course = courses.find((candidate) => candidate.id === item.courseId);
            const coverImageUrl = course?.coverImageUrl;
            const managedStorageImage = coverImageUrl?.includes(
              '/storage/v1/object/sign/traderlab-course-images/',
            );

            return (
              <Link
                key={`${item.courseId}-${item.contentId}`}
                className={homeClass('recent-item')}
                href={`/courses/${encodeURIComponent(item.courseId)}/contents/${encodeURIComponent(item.contentId)}`}
                aria-label={`Continuar ${item.title}, em ${item.courseTitle}`}
              >
                <span
                  className={homeClass('recent-art')}
                  style={
                    !managedStorageImage && coverImageUrl
                      ? { backgroundImage: `url(${coverImageUrl})` }
                      : undefined
                  }
                  aria-hidden="true"
                >
                  {managedStorageImage && coverImageUrl ? (
                    <CourseImage
                      className={homeClass('recent-art-image')}
                      src={coverImageUrl}
                      alt=""
                      sizes="(max-width: 560px) 120px, 220px"
                    />
                  ) : null}
                  <span className={homeClass('recent-play')}>
                    <Play aria-hidden="true" size={17} fill="currentColor" />
                  </span>
                </span>
                <span className={homeClass('recent-main')}>
                  <span className={homeClass('recent-course')}>{item.courseTitle}</span>
                  <strong>{item.title}</strong>
                  <span className={homeClass('recent-meta')}>
                    {item.moduleTitle} · {formatAccessTime(item.lastAccessedAt)}
                  </span>
                </span>
                <span className={homeClass('recent-progress')}>
                  {course ? (
                    <>
                      <span>PROGRESSO DO CURSO</span>
                      <strong>{course.progressPercent}% concluído</strong>
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
                    </>
                  ) : (
                    <strong>{item.completed ? 'Conteúdo concluído' : 'Em andamento'}</strong>
                  )}
                  <span className={homeClass('recent-resume')}>
                    Retomar aula <span aria-hidden="true">→</span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          mark="▶"
          title="Sua próxima aula começa aqui"
          description="Escolha um curso e comece a estudar. Seus conteúdos acessados vão aparecer nesta seção."
        />
      )}
    </section>
  );
}
