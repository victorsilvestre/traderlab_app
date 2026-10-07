'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type {
  CourseImageUploadDto,
  ManagedCourseModuleDto,
} from '@traderlab/contracts';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';
import styles from './AdminModuleForm.module.css';

const bucket =
  process.env.NEXT_PUBLIC_COURSE_IMAGES_BUCKET ?? 'traderlab-course-images';
const maximumFileSize = 5 * 1024 * 1024;
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

export function AdminModuleForm({
  courseId,
  module,
}: {
  courseId: number;
  module?: ManagedCourseModuleDto;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createdModuleId, setCreatedModuleId] = useState<number | null>(null);

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

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
    setPreview(previewUrlRef.current);
    setFile(nextFile);
    setRemoveImage(false);
  }

  async function uploadCover(moduleId: number): Promise<string> {
    if (!file) throw new Error('Selecione uma imagem para enviar.');
    const response = await fetch('/api/admin/course-images/upload-url', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        kind: 'module',
        id: moduleId,
        contentType: file.type,
        sizeBytes: file.size,
      }),
    });
    const upload = (await response
      .json()
      .catch(() => ({}))) as CourseImageUploadDto & { message?: string };
    if (!response.ok)
      throw new Error(
        upload.message ?? 'Não foi possível preparar o envio da imagem.',
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

  async function associateImage(moduleId: number, imagePath: string | null) {
    const response = await fetch(
      `/api/admin/courses/${courseId}/modules/${moduleId}`,
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ imagePath }),
      },
    );
    const result = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    if (!response.ok)
      throw new Error(
        result.message ?? 'Não foi possível associar a imagem ao módulo.',
      );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const fields = new FormData(event.currentTarget);
    const body = {
      title: String(fields.get('title') ?? ''),
      description: String(fields.get('description') ?? ''),
    };
    let savedModuleId = module?.id;
    try {
      const response = await fetch(
        module
          ? `/api/admin/courses/${courseId}/modules/${module.id}`
          : `/api/admin/courses/${courseId}/modules`,
        {
          method: module ? 'PATCH' : 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as ManagedCourseModuleDto & { message?: string };
      if (!response.ok)
        throw new Error(result.message ?? 'Não foi possível salvar o módulo.');
      savedModuleId = result.id;
      if (!module) setCreatedModuleId(result.id);

      if (savedModuleId && removeImage)
        await associateImage(savedModuleId, null);
      if (savedModuleId && file) {
        const imagePath = await uploadCover(savedModuleId);
        await associateImage(savedModuleId, imagePath);
      }
      router.push(`/courses/${courseId}`);
      router.refresh();
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar o módulo.';
      setError(
        savedModuleId && !module
          ? `${message} O módulo foi criado como rascunho; retome a edição para concluir o envio da imagem.`
          : message,
      );
    } finally {
      setBusy(false);
    }
  }

  const currentImage = removeImage
    ? null
    : (preview ?? module?.imageUrl ?? null);

  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor="title">Nome do módulo</label>
      <input
        id="title"
        name="title"
        defaultValue={module?.title ?? ''}
        maxLength={180}
        required
      />
      <label htmlFor="description">
        Descrição <span>Opcional</span>
      </label>
      <textarea
        id="description"
        name="description"
        defaultValue={module?.description ?? ''}
        maxLength={20000}
        rows={5}
      />

      <div className={styles.coverField}>
        <label htmlFor="coverImage">
          Imagem de capa <span>Opcional</span>
        </label>
        <p className={styles.coverHint}>
          Proporção 16:9 · resolução recomendada de 1920 × 1080 px · JPEG, PNG
          ou WebP · até 5 MB.
        </p>
        <div className={styles.coverPreview}>
          {currentImage ? (
            <Image
              src={currentImage}
              alt="Prévia da capa do módulo"
              width={640}
              height={360}
              quality={90}
              unoptimized={Boolean(preview)}
            />
          ) : (
            <span>Nenhuma capa selecionada</span>
          )}
        </div>
        <input
          ref={inputRef}
          className={styles.fileInput}
          id="coverImage"
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
            : module?.imagePath
              ? 'Substituir imagem'
              : 'Enviar imagem'}
        </button>
        {module?.imageUrl && !removeImage && !file && (
          <button
            className={styles.removeCover}
            type="button"
            onClick={() => setRemoveImage(true)}
          >
            Remover imagem atual
          </button>
        )}
        {file && (
          <button
            className={styles.removeCover}
            type="button"
            onClick={() => selectFile()}
          >
            Cancelar nova imagem
          </button>
        )}
      </div>

      {!module && (
        <p className={styles.draftNote}>
          O módulo será salvo como rascunho no final da ordem atual.
        </p>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
          {createdModuleId && (
            <Link href={`/courses/${courseId}/modules/${createdModuleId}`}>
              Editar módulo
            </Link>
          )}
        </p>
      )}
      <div className={styles.actions}>
        <Link href={`/courses/${courseId}`}>Cancelar</Link>
        <button type="submit" disabled={busy}>
          {busy ? 'Salvando…' : module ? 'Salvar alterações' : 'Criar módulo'}
        </button>
      </div>
    </form>
  );
}
