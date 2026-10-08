'use client';

import type {
  FormEvent,
  RefObject,
} from 'react';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type {
  ManagedNotificationCourseDto,
  ManagedNotificationCreatedDto,
  ManagedNotificationInputDto,
} from '@traderlab/contracts';
import styles from './AdminNotificationForm.module.css';

function closeDialog(dialog: RefObject<HTMLDialogElement | null>) {
  if (dialog.current?.open) dialog.current.close();
}

function normalizeLinkInput(value: string) {
  const link = value.trim();
  if (!link) return null;
  return /^www\./i.test(link) ? `https://${link}` : link;
}

export function AdminNotificationForm({
  courses,
  returnTo,
  initialError,
}: {
  courses: ManagedNotificationCourseDto[];
  returnTo: string;
  initialError?: string;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const busyRef = useRef(false);
  const [audience, setAudience] = useState<'general' | 'course'>('general');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pendingInput, setPendingInput] = useState<ManagedNotificationInputDto | null>(null);

  function requestConfirmation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const fields = new FormData(event.currentTarget);
    const nextInput: ManagedNotificationInputDto = {
      title: String(fields.get('title') ?? '').trim(),
      description: String(fields.get('description') ?? '').trim(),
      linkUrl: normalizeLinkInput(String(fields.get('linkUrl') ?? '')),
      audience,
      courseId: audience === 'course' ? Number(fields.get('courseId')) : null,
    };
    if (nextInput.linkUrl && nextInput.linkUrl.length > 2048) {
      setError('O link deve ter até 2.048 caracteres.');
      return;
    }
    setPendingInput(nextInput);
    dialogRef.current?.showModal();
  }

  async function sendNotification() {
    if (!pendingInput || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(pendingInput),
      });
      const result = (await response.json().catch(() => ({}))) as
        | ManagedNotificationCreatedDto
        | { message?: string };
      if (!response.ok || !('id' in result)) {
        throw new Error(
          'message' in result && result.message
            ? result.message
            : 'Não foi possível enviar a notificação.',
        );
      }
      closeDialog(dialogRef);
      router.push(`/notifications/${result.id}?returnTo=${encodeURIComponent(returnTo)}`);
      router.refresh();
    } catch (cause) {
      closeDialog(dialogRef);
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível enviar a notificação. Tente novamente.',
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      {error && <p className={styles.error} role="alert">{error}</p>}
        <form className={styles.form} onSubmit={requestConfirmation}>
          <label className={styles.field}>
            Título
            <input name="title" required maxLength={180} autoComplete="off" />
          </label>
          <label className={styles.field}>
            Descrição
            <textarea name="description" required maxLength={3000} />
          </label>
          <label className={styles.field}>
            Link de destino <span>(opcional)</span>
            <input name="linkUrl" maxLength={2048} placeholder="https://…, www.exemplo.com.br ou /caminho" />
          </label>
          <label className={styles.field}>
            Público
            <select
              name="audience"
              value={audience}
              onChange={(event) => setAudience(event.target.value as 'general' | 'course')}
            >
              <option value="general">Todos os usuários cadastrados</option>
              <option value="course">Alunos com matrícula no curso</option>
            </select>
          </label>
          {audience === 'general' ? (
            <p className={styles.hint}>
              Inclui todos os usuários cadastrados na plataforma, independentemente do perfil.
            </p>
          ) : (
            <>
              <label className={styles.field}>
                Curso
                <select name="courseId" required defaultValue="">
                  <option value="" disabled>Selecione um curso</option>
                  {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
              </label>
              <p className={styles.hint}>
                Inclui todas as pessoas com matrícula ativa no curso selecionado, independentemente do perfil.
              </p>
            </>
          )}
          {audience === 'course' && courses.length === 0 && (
            <p className={styles.error} role="status">
              {initialError ?? 'Não há cursos cadastrados disponíveis para selecionar.'}
            </p>
          )}
          <div className={styles.summary}>
            O disparo é imediato. A notificação aparecerá na plataforma para os usuários elegíveis do público escolhido.
          </div>
          <div className={styles.actions}>
            <Link className={styles.button} href={returnTo}>Cancelar</Link>
            <button className={`${styles.button} ${styles.primary}`} type="submit" disabled={busy || (audience === 'course' && courses.length === 0)}>
              Enviar notificação
            </button>
          </div>
        </form>
      <dialog className={styles.dialog} ref={dialogRef} aria-labelledby="confirm-title">
        <h2 id="confirm-title">Confirmar disparo</h2>
        <p>
          {pendingInput?.audience === 'general'
            ? 'A notificação será enviada a todos os usuários cadastrados na plataforma, independentemente do perfil.'
            : `A notificação será enviada a todas as pessoas com matrícula ativa em ${courses.find((course) => course.id === pendingInput?.courseId)?.title ?? 'no curso selecionado'}, independentemente do perfil.`}
        </p>
        <div className={styles.actions}>
          <button className={styles.button} type="button" onClick={() => closeDialog(dialogRef)} disabled={busy}>Voltar</button>
          <button className={`${styles.button} ${styles.primary}`} type="button" onClick={sendNotification} disabled={busy}>
            {busy ? 'Enviando…' : 'Confirmar e enviar'}
          </button>
        </div>
      </dialog>
    </>
  );
}
