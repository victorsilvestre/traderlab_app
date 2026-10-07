'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ManagedCourseDto } from '@traderlab/contracts';
import styles from './AdminCourseCatalog.module.css';

export function CoursePublicationButton({ course }: { course: ManagedCourseDto }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const published = course.status === 'published';

  async function updateStatus() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: published ? 'draft' : 'published' }),
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(body.message ?? 'Não foi possível atualizar a publicação.');
      dialogRef.current?.close();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível atualizar a publicação.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        className={`${styles.iconButton} ${published ? styles.dangerAction : ''}`}
        type="button"
        aria-label={published ? `Despublicar ${course.title}` : `Publicar ${course.title}`}
        data-tooltip={published ? 'Despublicar' : 'Publicar'}
        onClick={() => {
          setError('');
          if (published) dialogRef.current?.showModal();
          else void updateStatus();
        }}
        disabled={busy}
      >
        {published ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="3" />
            <path d="M9 9v6m6-6v6" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="m9 7 7 5-7 5V7Z" />
          </svg>
        )}
      </button>
      {error && <span className={styles.srOnly} role="alert">{error}</span>}
      <dialog ref={dialogRef} className={styles.confirmDialog} aria-labelledby={`unpublish-title-${course.id}`} aria-describedby={`unpublish-copy-${course.id}`}>
        <div className={styles.dialogIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3 2.8 19h18.4L12 3Z" />
            <path d="M12 9v4m0 3h.01" />
          </svg>
        </div>
        <h2 id={`unpublish-title-${course.id}`}>Despublicar curso?</h2>
        <p id={`unpublish-copy-${course.id}`}>
          <strong>{course.title}</strong> deixará de aparecer para os alunos. Matrículas, dados do curso e progresso serão mantidos; nenhuma informação será apagada.
        </p>
        {error && <p className={styles.dialogError} role="alert">{error}</p>}
        <div className={styles.dialogActions}>
          <button type="button" className={styles.cancelButton} onClick={() => dialogRef.current?.close()} disabled={busy}>Cancelar</button>
          <button type="button" className={styles.confirmButton} onClick={() => void updateStatus()} disabled={busy}>
            {busy ? 'Despublicando…' : 'Confirmar despublicação'}
          </button>
        </div>
      </dialog>
    </>
  );
}
