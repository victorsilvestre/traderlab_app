'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type {
  ManagedCourseDto,
  ManagedCourseModuleDto,
  ManagedCourseModulesDto,
} from '@traderlab/contracts';
import { AdminBackLink } from '../navigation/AdminBackLink';
import styles from './AdminCourseModules.module.css';

export function AdminCourseModules({
  course,
  data,
  isAdministrator,
  returnTo,
}: {
  course: ManagedCourseDto;
  data: ManagedCourseModulesDto;
  isAdministrator: boolean;
  returnTo: string;
}) {
  const [items, setItems] = useState(data.items);
  const [expandedIds, setExpandedIds] = useState(
    () => new Set(data.items.slice(0, 1).map((item) => item.id)),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const totalContents = items.reduce(
    (total, item) => total + item.contentCount,
    0,
  );
  const managedStorageImage = course.coverImageUrl?.includes(
    '/storage/v1/object/sign/traderlab-course-images/',
  );
  const currentCourseHref = `/courses/${course.id}?returnTo=${encodeURIComponent(returnTo)}`;

  async function move(moduleId: number, offset: -1 | 1) {
    const index = items.findIndex((item) => item.id === moduleId);
    const nextIndex = index + offset;
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length || busy) return;
    const next = [...items];
    const movedItem = next[index]!;
    next[index] = next[nextIndex]!;
    next[nextIndex] = movedItem;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(
        `/api/admin/courses/${course.id}/modules/order`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orderedIds: next.map((item) => item.id) }),
        },
      );
      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!response.ok)
        throw new Error(
          body.message ?? 'Não foi possível salvar a ordem dos módulos.',
        );
      setItems(next);
      window.location.reload();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar a ordem dos módulos.',
      );
    } finally {
      setBusy(false);
    }
  }

  function toggleExpanded(moduleId: number) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  return (
    <section className={styles.builder} aria-labelledby="course-title">
      <AdminBackLink href={returnTo} />
      <header className={styles.courseCard}>
        <div className={styles.courseCover}>
          {managedStorageImage && course.coverImageUrl ? (
            <Image
              src={course.coverImageUrl}
              alt=""
              fill
              sizes="128px"
              quality={90}
            />
          ) : course.coverImageUrl ? (
            // Legacy course cover URLs remain supported without exposing storage paths.
            <span
              className={styles.legacyCover}
              style={{ backgroundImage: `url(${course.coverImageUrl})` }}
            />
          ) : (
            <span>Capa do curso</span>
          )}
        </div>
        <div className={styles.courseInfo}>
          <p className={styles.eyebrow}>Curso online</p>
          <h1 id="course-title">{course.title}</h1>
          <div className={styles.courseMeta}>
            <span
              className={
                course.status === 'published' ? styles.published : styles.draft
              }
            >
              <span aria-hidden="true" />
              {course.status === 'published' ? 'Publicado' : 'Rascunho'}
            </span>
            <span>
              {items.length} {items.length === 1 ? 'módulo' : 'módulos'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {totalContents} {totalContents === 1 ? 'conteúdo' : 'conteúdos'}
            </span>
          </div>
        </div>
        <div className={styles.courseActions}>
          {isAdministrator && <>
            <Link className={styles.settingsButton} href={`/enrollments?courseId=${course.id}&returnTo=${encodeURIComponent(currentCourseHref)}`} aria-label="Ver matrículas do curso" data-tooltip="Ver matrículas">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 8v6M17 11h6" />
              </svg>
            </Link>
            {course.status === 'published' && <Link className={styles.settingsButton} href={`/enrollments/new?courseId=${course.id}&returnTo=${encodeURIComponent(currentCourseHref)}`} aria-label="Matricular usuário neste curso" data-tooltip="Matricular usuário">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M19 8v6M16 11h6" />
              </svg>
            </Link>}
          </>}
          <Link className={styles.settingsButton} href={`/courses/${course.id}/settings?returnTo=${encodeURIComponent(currentCourseHref)}`} aria-label="Configurações do curso" data-tooltip="Configurações do curso">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
              <path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3.1 1.3v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3.1-1.3l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-1.3-3.1h-.2a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 1.3-3.1l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3.1-1.3v-.2a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3.1 1.3l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 1.3 3.1h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-1.3 3.1Z" />
            </svg>
          </Link>
        </div>
      </header>

      <header className={styles.contentHeading}>
        <h2>Conteúdo</h2>
        <p>Organize módulos, aulas e materiais deste curso</p>
      </header>

      <div className={styles.toolbar}>
        <div>
          <h3>Módulos do curso</h3>
          <p>
            Expanda um módulo para consultar as aulas e os materiais
            cadastrados.
          </p>
        </div>
        <Link
          className={styles.primaryButton}
          href={`/courses/${course.id}/modules/new?returnTo=${encodeURIComponent(currentCourseHref)}`}
          aria-label="Adicionar módulo"
          data-tooltip="Adicionar módulo"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {items.length === 0 ? (
        <div className={styles.empty}>
          <h3>Este curso ainda não tem módulos</h3>
          <p>
            Crie o primeiro módulo para começar a organizar aulas e materiais.
          </p>
          <Link
            className={styles.primaryButton}
            href={`/courses/${course.id}/modules/new?returnTo=${encodeURIComponent(currentCourseHref)}`}
          >
            Adicionar módulo
          </Link>
        </div>
      ) : (
        <div className={styles.moduleList}>
          {items.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              index={index}
              count={items.length}
              courseId={course.id}
              returnTo={currentCourseHref}
              busy={busy}
              expanded={expandedIds.has(module.id)}
              onToggle={() => toggleExpanded(module.id)}
              onMove={move}
              onStatusUpdate={(moduleId, status) =>
                setItems((current) =>
                  current.map((item) =>
                    item.id === moduleId ? { ...item, status } : item,
                  ),
                )
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ModuleCard({
  module,
  index,
  count,
  courseId,
  returnTo,
  busy,
  expanded,
  onToggle,
  onMove,
  onStatusUpdate,
}: {
  module: ManagedCourseModuleDto;
  index: number;
  count: number;
  courseId: number;
  returnTo: string;
  busy: boolean;
  expanded: boolean;
  onToggle: () => void;
  onMove: (moduleId: number, offset: -1 | 1) => void;
  onStatusUpdate: (
    moduleId: number,
    status: ManagedCourseModuleDto['status'],
  ) => void;
}) {
  const moduleContents = module.contents ?? [];
  const label = module.contentCount === 1 ? 'conteúdo' : 'conteúdos';
  const [expandedMaterialIds, setExpandedMaterialIds] = useState(
    () => new Set<number>(),
  );

  function toggleMaterials(contentId: number) {
    setExpandedMaterialIds((current) => {
      const next = new Set(current);
      if (next.has(contentId)) next.delete(contentId);
      else next.add(contentId);
      return next;
    });
  }

  return (
    <article className={styles.module}>
      <div className={styles.moduleHeader}>
        <div
          className={styles.reorderActions}
          aria-label={`Posição ${index + 1}`}
        >
          <button
            className={styles.iconButton}
            type="button"
            aria-label={`Mover ${module.title} para cima`}
            data-tooltip="Mover para cima"
            disabled={busy || index === 0}
            onClick={() => onMove(module.id, -1)}
          >
            ↑
          </button>
          <button
            className={styles.iconButton}
            type="button"
            aria-label={`Mover ${module.title} para baixo`}
            data-tooltip="Mover para baixo"
            disabled={busy || index === count - 1}
            onClick={() => onMove(module.id, 1)}
          >
            ↓
          </button>
        </div>
        <div className={styles.moduleSummary}>
          <div className={styles.moduleCover} aria-hidden="true">
            {module.imageUrl ? (
              <Image
                src={module.imageUrl}
                alt=""
                fill
                sizes="56px"
                quality={90}
              />
            ) : (
              <span>▧</span>
            )}
          </div>
          <div className={styles.moduleInfo}>
            <h3>{module.title}</h3>
            {module.description && <p>{module.description}</p>}
          </div>
        </div>
        <div className={styles.moduleMeta}>
          <span>
            {module.contentCount} {label}
          </span>
          <span
            className={
              module.status === 'published' ? styles.published : styles.draft
            }
          >
            <span aria-hidden="true" />
            {module.status === 'published' ? 'Publicado' : 'Rascunho'}
          </span>
        </div>
        <div className={styles.moduleActions}>
          <Link
            className={styles.iconButton}
            href={`/courses/${courseId}/modules/${module.id}/lessons/new?returnTo=${encodeURIComponent(returnTo)}`}
            aria-label={`Criar aula no módulo ${module.title}`}
            data-tooltip="Criar aula"
          >
            <ActionIcon kind="plus" />
          </Link>
          <Link
            className={styles.iconButton}
            href={`/courses/${courseId}/modules/${module.id}?returnTo=${encodeURIComponent(returnTo)}`}
            aria-label={`Editar ${module.title}`}
            data-tooltip="Editar módulo"
          >
            ✎
          </Link>
          <ModulePublicationButton
            module={module}
            courseId={courseId}
            onUpdated={(status) => onStatusUpdate(module.id, status)}
          />
          <button
            className={`${styles.iconButton} ${styles.expandButton}`}
            type="button"
            aria-label={
              expanded ? `Recolher ${module.title}` : `Expandir ${module.title}`
            }
            aria-expanded={expanded}
            data-tooltip={expanded ? 'Recolher módulo' : 'Expandir módulo'}
            onClick={onToggle}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
      {expanded && (
        <div className={styles.moduleBody}>
          {moduleContents.length ? (
            <div className={styles.contentList}>
              {moduleContents.map((content) => (
                <article className={styles.contentItem} key={content.id}>
                  {content.kind === 'lesson' ? (
                    <div className={styles.lessonCover} aria-hidden="true">
                      {content.imageUrl ? (
                        <Image
                          src={content.imageUrl}
                          alt=""
                          fill
                          sizes="64px"
                          quality={90}
                        />
                      ) : (
                        <span>▶</span>
                      )}
                    </div>
                  ) : (
                    <span className={styles.contentTypeIcon} aria-hidden="true">
                      ▤
                    </span>
                  )}
                  <div className={styles.contentInfo}>
                    <div className={styles.contentMeta}>
                      <span className={styles.contentType}>
                        {content.kind === 'lesson'
                          ? 'Aula'
                          : 'Material independente'}
                      </span>
                      <span
                        className={
                          content.status === 'published'
                            ? styles.published
                            : styles.draft
                        }
                      >
                        <span aria-hidden="true" />
                        {content.status === 'published'
                          ? 'Publicado'
                          : 'Rascunho'}
                      </span>
                    </div>
                    <strong>{content.title}</strong>
                    {content.description && <p>{content.description}</p>}
                  </div>
                  {content.kind === 'lesson' && (
                    <LessonActions
                      courseId={courseId}
                      moduleId={module.id}
                      returnTo={returnTo}
                      content={content}
                      lessons={moduleContents.filter(
                        (item) => item.kind === 'lesson',
                      )}
                      materialsExpanded={expandedMaterialIds.has(content.id)}
                      onToggleMaterials={() => toggleMaterials(content.id)}
                    />
                  )}
                  {content.kind === 'lesson' &&
                    content.materials.length > 0 && (
                      <div
                        id={`lesson-materials-${content.id}`}
                        className={styles.attachments}
                        hidden={!expandedMaterialIds.has(content.id)}
                      >
                        <div className={styles.attachmentsTitle}>
                          Materiais complementares{' '}
                          <span>{content.materials.length}</span>
                        </div>
                        {content.materials.map((material) => (
                          <div className={styles.attachment} key={material.id}>
                            <span aria-hidden="true">▤</span>
                            <span>
                              {material.name}
                              {material.description
                                ? ` — ${material.description}`
                                : ''}
                            </span>
                            <span>{formatFileSize(material.sizeBytes)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                </article>
              ))}
            </div>
          ) : (
            <p className={styles.emptyContents}>
              Este módulo ainda não tem aulas ou materiais cadastrados.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function LessonActions({
  courseId,
  moduleId,
  returnTo,
  content,
  lessons,
  materialsExpanded,
  onToggleMaterials,
}: {
  courseId: number;
  moduleId: number;
  returnTo: string;
  content: ManagedCourseModuleDto['contents'][number];
  lessons: ManagedCourseModuleDto['contents'];
  materialsExpanded: boolean;
  onToggleMaterials: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lessonIndex = lessons.findIndex((item) => item.id === content.id);
  const published = content.status === 'published';
  const dialogId = `unpublish-lesson-${content.id}`;

  async function save(body: object, suffix = '') {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${content.id}${suffix}`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        },
      );
      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!response.ok)
        throw new Error(result.message ?? 'Não foi possível atualizar a aula.');
      (document.getElementById(dialogId) as HTMLDialogElement | null)?.close();
      window.location.reload();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível atualizar a aula.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function move(direction: -1 | 1) {
    const next = [...lessons];
    const target = lessonIndex + direction;
    if (target < 0 || target >= next.length) return;
    [next[lessonIndex], next[target]] = [next[target]!, next[lessonIndex]!];
    setBusy(true);
    setError('');
    try {
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/order`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orderedIds: next.map((item) => item.id) }),
        },
      );
      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!response.ok)
        throw new Error(
          result.message ?? 'Não foi possível salvar a ordem das aulas.',
        );
      window.location.reload();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar a ordem das aulas.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.lessonActions}>
      <Link
        className={styles.iconButton}
        href={`/courses/${courseId}/modules/${moduleId}/lessons/${content.id}?returnTo=${encodeURIComponent(returnTo)}`}
        aria-label={`Editar aula ${content.title}`}
        data-tooltip="Editar aula"
      >
        <ActionIcon kind="edit" />
      </Link>
      <button
        className={styles.iconButton}
        type="button"
        disabled={busy || lessonIndex === 0}
        aria-label={`Mover aula ${content.title} para cima`}
        data-tooltip="Mover para cima"
        onClick={() => void move(-1)}
      >
        <ActionIcon kind="up" />
      </button>
      <button
        className={styles.iconButton}
        type="button"
        disabled={busy || lessonIndex === lessons.length - 1}
        aria-label={`Mover aula ${content.title} para baixo`}
        data-tooltip="Mover para baixo"
        onClick={() => void move(1)}
      >
        <ActionIcon kind="down" />
      </button>
      <button
        className={`${styles.iconButton} ${published ? styles.dangerAction : ''}`}
        type="button"
        disabled={busy}
        aria-label={
          published
            ? `Despublicar aula ${content.title}`
            : `Publicar aula ${content.title}`
        }
        data-tooltip={published ? 'Despublicar aula' : 'Publicar aula'}
        onClick={(event) => {
          setError('');
          if (published)
            event.currentTarget.parentElement
              ?.querySelector('dialog')
              ?.showModal();
          else void save({ status: 'published' });
        }}
      >
        <ActionIcon kind={published ? 'pause' : 'play'} />
      </button>
      <button
        className={`${styles.iconButton} ${styles.materialToggle}`}
        type="button"
        aria-label={
          content.materials.length === 0
            ? `A aula ${content.title} não possui materiais`
            : materialsExpanded
              ? `Recolher materiais de ${content.title}`
              : `Mostrar materiais de ${content.title}`
        }
        aria-expanded={materialsExpanded}
        aria-controls={
          content.materials.length > 0
            ? `lesson-materials-${content.id}`
            : undefined
        }
        data-tooltip={
          content.materials.length === 0
            ? 'Nenhum material disponível'
            : materialsExpanded
              ? 'Recolher materiais'
              : 'Mostrar materiais'
        }
        disabled={content.materials.length === 0}
        onClick={onToggleMaterials}
      >
        <ActionIcon
          kind={materialsExpanded ? 'materialsOpen' : 'materialsClosed'}
        />
      </button>
      {error && (
        <span className={styles.inlineError} role="alert">
          {error}
        </span>
      )}
      {published && (
        <dialog
          id={dialogId}
          className={styles.dialog}
          aria-labelledby={`${dialogId}-title`}
        >
          <h2 id={`${dialogId}-title`}>Despublicar aula?</h2>
          <p>
            <strong>{content.title}</strong> deixará de aparecer aos alunos. O
            conteúdo, os anexos e o progresso serão preservados.
          </p>
          {error && (
            <p className={styles.dialogError} role="alert">
              {error}
            </p>
          )}
          <div className={styles.dialogActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={busy}
              onClick={(event) =>
                event.currentTarget.closest('dialog')?.close()
              }
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.confirmButton}
              disabled={busy}
              onClick={() => void save({ status: 'draft' })}
            >
              {busy ? 'Despublicando…' : 'Confirmar despublicação'}
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}

function ActionIcon({
  kind,
}: {
  kind:
    | 'edit'
    | 'up'
    | 'down'
    | 'pause'
    | 'play'
    | 'plus'
    | 'materialsClosed'
    | 'materialsOpen';
}) {
  const paths = {
    edit: <path d="m14 5 5 5M4 20l4.2-.8L19 8.4 15.6 5 4.8 15.8 4 20Z" />,
    up: <path d="M12 19V5m-6 6 6-6 6 6" />,
    down: <path d="M12 5v14m6-6-6 6-6-6" />,
    pause: <path d="M8 5v14M16 5v14" />,
    play: <path d="m8 5 12 7-12 7V5Z" />,
    plus: <path d="M12 5v14m-7-7h14" />,
    materialsClosed: (
      <>
        <path d="M4 6h6l2 2h8v10H4z" />
        <path d="m9 11 3 3 3-3" />
      </>
    ),
    materialsOpen: (
      <>
        <path d="M4 6h6l2 2h8v10H4z" />
        <path d="m9 14 3-3 3 3" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[kind]}
    </svg>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

function ModulePublicationButton({
  module,
  courseId,
  onUpdated,
}: {
  module: ManagedCourseModuleDto;
  courseId: number;
  onUpdated: (status: ManagedCourseModuleDto['status']) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialogId = `unpublish-module-${module.id}`;
  const published = module.status === 'published';

  async function updateStatus() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${module.id}`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ status: published ? 'draft' : 'published' }),
        },
      );
      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!response.ok)
        throw new Error(
          body.message ?? 'Não foi possível atualizar a publicação.',
        );
      (document.getElementById(dialogId) as HTMLDialogElement | null)?.close();
      onUpdated(published ? 'draft' : 'published');
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível atualizar a publicação.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        className={`${styles.iconButton} ${published ? styles.dangerAction : ''}`}
        type="button"
        aria-label={
          published ? `Despublicar ${module.title}` : `Publicar ${module.title}`
        }
        data-tooltip={published ? 'Despublicar' : 'Publicar'}
        disabled={busy}
        onClick={(event) => {
          setError('');
          if (published)
            event.currentTarget.parentElement
              ?.querySelector('dialog')
              ?.showModal();
          else void updateStatus();
        }}
      >
        {published ? 'Ⅱ' : '▶'}
      </button>
      {error && (
        <span className={styles.srOnly} role="alert">
          {error}
        </span>
      )}
      {published && (
        <dialog
          id={dialogId}
          className={styles.dialog}
          aria-labelledby={`${dialogId}-title`}
        >
          <h2 id={`${dialogId}-title`}>Despublicar módulo?</h2>
          <p>
            <strong>{module.title}</strong> e seus conteúdos deixarão de
            aparecer aos alunos. Os dados e o progresso serão mantidos; nada
            será apagado.
          </p>
          {error && (
            <p className={styles.dialogError} role="alert">
              {error}
            </p>
          )}
          <div className={styles.dialogActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={(event) =>
                event.currentTarget.closest('dialog')?.close()
              }
              disabled={busy}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.confirmButton}
              onClick={() => void updateStatus()}
              disabled={busy}
            >
              {busy ? 'Despublicando…' : 'Confirmar despublicação'}
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
