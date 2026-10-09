'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleAlert, Pause, Play } from 'lucide-react';
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
          <Pause aria-hidden="true" size={18} strokeWidth={1.8} />
        ) : (
          <Play aria-hidden="true" size={18} strokeWidth={1.8} />
        )}
      </button>
      {error && <span className={styles.srOnly} role="alert">{error}</span>}
      <dialog ref={dialogRef} className={styles.confirmDialog} aria-labelledby={`unpublish-title-${course.id}`} aria-describedby={`unpublish-copy-${course.id}`}>
        <div className={styles.dialogIcon} aria-hidden="true">
          <CircleAlert aria-hidden="true" size={22} strokeWidth={1.8} />
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
