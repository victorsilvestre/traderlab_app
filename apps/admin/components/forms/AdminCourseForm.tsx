'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import type {
  CourseImageUploadDto,
  ManagedCourseDto,
} from '@traderlab/contracts';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';
import styles from './AdminCourseForm.module.css';

const bucket =
  process.env.NEXT_PUBLIC_COURSE_IMAGES_BUCKET ?? 'traderlab-course-images';
const maximumFileSize = 5 * 1024 * 1024;
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

export function AdminCourseForm({ course, returnTo }: { course?: ManagedCourseDto; returnTo: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [createdCourseId, setCreatedCourseId] = useState<number | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const editing = Boolean(course);

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  async function uploadCover(courseId: number): Promise<string> {
    if (!file) throw new Error('Selecione uma imagem para enviar.');
    const uploadResponse = await fetch('/api/admin/course-images/upload-url', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        kind: 'course',
        id: courseId,
        contentType: file.type,
        sizeBytes: file.size,
      }),
    });
    const upload = (await uploadResponse
      .json()
      .catch(() => ({}))) as CourseImageUploadDto & { message?: string };
    if (!uploadResponse.ok)
      throw new Error(
        upload.message ?? 'Não foi possível preparar o envio da capa.',
      );

    const { error: storageError } = await createSupabaseBrowserClient()
      .storage.from(bucket)
      .uploadToSignedUrl(upload.path, upload.token, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });
    if (storageError)
      throw new Error('Não foi possível enviar a imagem. Tente novamente.');
    return upload.path;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const fields = new FormData(event.currentTarget);
    const body = {
      title: String(fields.get('title') ?? ''),
      description: String(fields.get('description') ?? ''),
      ...(editing ? { status: 'published' as const } : {}),
    };
    let savedCourseId = course?.id;
    try {
      const response = await fetch(
        editing ? `/api/admin/courses/${course!.id}` : '/api/admin/courses',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as ManagedCourseDto & { message?: string };
      if (!response.ok)
        throw new Error(result.message ?? 'Não foi possível salvar o curso.');
      savedCourseId = result.id;
      if (!editing) setCreatedCourseId(result.id);

      if (file && savedCourseId) {
        const coverImagePath = await uploadCover(savedCourseId);
        const coverResponse = await fetch(
          `/api/admin/courses/${savedCourseId}`,
          {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ coverImagePath }),
          },
        );
        const coverResult = (await coverResponse.json().catch(() => ({}))) as {
          message?: string;
        };
        if (!coverResponse.ok)
          throw new Error(
            coverResult.message ??
              'O curso foi salvo, mas não foi possível associar a capa. Tente enviá-la novamente.',
          );
      }
      router.push(savedCourseId ? `/courses/${savedCourseId}?returnTo=${encodeURIComponent(returnTo)}` : returnTo);
      router.refresh();
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar o curso.';
      setError(
        savedCourseId && !editing
          ? `${message} O curso foi salvo. Acesse a gestão do curso para concluir o envio da capa.`
          : message,
      );
    } finally {
      setBusy(false);
    }
  }

  function selectFile(nextFile?: File) {
    if (!nextFile) {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
      setPreview(null);
      setFile(null);
      return;
    }
    if (!allowedMimeTypes.includes(nextFile.type)) {
      setError('Use uma imagem JPEG, PNG ou WebP.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    if (nextFile.size > maximumFileSize) {
      setError('A imagem deve ter até 5 MB.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setError('');
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = URL.createObjectURL(nextFile);
    setFile(nextFile);
    setPreview(previewUrlRef.current);
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor="title">Nome do curso</label>
      <input
        id="title"
        name="title"
        defaultValue={course?.title ?? ''}
        maxLength={180}
        autoComplete="off"
        required
      />
      <label htmlFor="description">Descrição</label>
      <textarea
        id="description"
        name="description"
        defaultValue={course?.description ?? ''}
        maxLength={20000}
        rows={6}
        required
      />
      <div className={styles.coverField}>
        <label htmlFor="coverImage">
          Imagem de capa <span>Opcional</span>
        </label>
        <p className={styles.coverHint}>
          Proporção 16:9 · resolução recomendada de 1920 × 1080 px · JPEG, PNG
          ou WebP · até 5 MB. Imagens com outras dimensões poderão ser
          recortadas na plataforma.
        </p>
        <div className={styles.coverPreview}>
          {(preview ?? course?.coverImageUrl) ? (
            <Image
              src={preview ?? course?.coverImageUrl ?? ''}
              alt="Prévia da capa do curso"
              width={640}
              height={360}
              unoptimized
            />
          ) : (
            <span>Nenhuma capa selecionada</span>
          )}
        </div>
        <input
          ref={inputRef}
          className={styles.fileInput}
          id="coverImage"
          name="coverImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
        <button
          className={styles.coverButton}
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
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
            <path d="M12 16V4m-4 4 4-4 4 4M4 16v4h16v-4" />
          </svg>
          {file
            ? 'Trocar imagem'
            : course?.coverImagePath
              ? 'Substituir imagem'
              : 'Enviar imagem'}
        </button>
        {file && (
          <button
            className={styles.removeCover}
            type="button"
            onClick={() => selectFile()}
          >
            Remover nova imagem
          </button>
        )}
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}{' '}
          {createdCourseId && (
            <Link href={`/courses/${createdCourseId}`}>Editar curso</Link>
          )}
        </p>
      )}
      <div className={styles.actions}>
        <button type="submit" disabled={busy}>
          {busy ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
