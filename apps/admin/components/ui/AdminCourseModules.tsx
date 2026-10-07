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
import styles from './AdminCourseModules.module.css';

export function AdminCourseModules({
  course,
  data,
}: {
  course: ManagedCourseDto;
  data: ManagedCourseModulesDto;
}) {
  const router = useRouter();
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
      router.refresh();
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
      <nav className={styles.breadcrumb} aria-label="Trilha de navegação">
        <Link href="/courses">Cursos</Link>
        <span aria-hidden="true">›</span>
        <span>{course.title}</span>
      </nav>

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
        <Link
          className={styles.settingsButton}
          href={`/courses/${course.id}/settings`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
            <path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3.1 1.3v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3.1-1.3l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-1.3-3.1h-.2a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 1.3-3.1l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3.1-1.3v-.2a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3.1 1.3l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 1.3 3.1h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-1.3 3.1Z" />
          </svg>
          Configurações do curso
        </Link>
      </header>

      <header className={styles.contentHeading}>
        <h2>Conteúdo</h2>
        <p>Organize módulos, aulas e materiais deste curso</p>
      </header>

      <div className={styles.toolbar}>
        <div>
          <h3>Estrutura do curso</h3>
          <p>
            Expanda um módulo para consultar as aulas e os materiais
            cadastrados.
          </p>
        </div>
        <Link
          className={styles.primaryButton}
          href={`/courses/${course.id}/modules/new`}
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
          Adicionar módulo
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
            href={`/courses/${course.id}/modules/new`}
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
        <div className={styles.moduleInfo}>
          <h3>{module.title}</h3>
          {module.description && <p>{module.description}</p>}
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
            href={`/courses/${courseId}/modules/${module.id}`}
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
                  <span className={styles.contentTypeIcon} aria-hidden="true">
                    {content.kind === 'lesson' ? '▶' : '▤'}
                  </span>
                  <div className={styles.contentInfo}>
                    <span className={styles.contentType}>
                      {content.kind === 'lesson'
                        ? 'Aula'
                        : 'Material independente'}
                    </span>
                    <strong>{content.title}</strong>
                    {content.description && <p>{content.description}</p>}
                  </div>
                  <span
                    className={
                      content.status === 'published'
                        ? styles.published
                        : styles.draft
                    }
                  >
                    <span aria-hidden="true" />
                    {content.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </span>
                  {content.kind === 'lesson' &&
                    content.materials.length > 0 && (
                      <div className={styles.attachments}>
                        <div className={styles.attachmentsTitle}>
                          Materiais complementares{' '}
                          <span>{content.materials.length}</span>
                        </div>
                        {content.materials.map((material) => (
                          <div className={styles.attachment} key={material.id}>
                            <span aria-hidden="true">▤</span>
                            <span>{material.name}</span>
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
          <p className={styles.readOnlyNote}>
            A gestão de aulas e materiais será habilitada nesta próxima etapa.
          </p>
        </div>
      )}
    </article>
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
