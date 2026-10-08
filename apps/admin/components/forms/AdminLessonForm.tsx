'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type {
  CourseImageUploadDto,
  CourseMaterialUploadDto,
  ManagedLessonDto,
  ManagedLessonMaterialDto,
} from '@traderlab/contracts';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';
import { RichTextEditor } from './RichTextEditor';
import styles from './AdminLessonForm.module.css';

const imageBucket =
  process.env.NEXT_PUBLIC_COURSE_IMAGES_BUCKET ?? 'traderlab-course-images';
const materialBucket =
  process.env.NEXT_PUBLIC_COURSE_MATERIALS_BUCKET ??
  'traderlab-course-materials';
const maximumFileSize = 50 * 1024 * 1024;
const maximumCoverSize = 5 * 1024 * 1024;
const allowedCoverTypes = ['image/jpeg', 'image/png', 'image/webp'];

type MaterialDraft = Omit<ManagedLessonMaterialDto, 'id'> & {
  id?: number;
  key: string;
  file?: File;
  uploadPath?: string;
  pendingChanges?: boolean;
};

export function AdminLessonForm({
  courseId,
  moduleId,
  lesson,
  returnTo,
}: {
  courseId: number;
  moduleId: number;
  lesson?: ManagedLessonDto;
  returnTo: string;
}) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const coverPreviewUrlRef = useRef<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [coverUploadPath, setCoverUploadPath] = useState<string | null>(null);
  const [body, setBody] = useState(lesson?.body ?? '');
  const [materials, setMaterials] = useState<MaterialDraft[]>(() =>
    (lesson?.materials ?? []).map((item) => ({
      ...item,
      key: `saved-${item.id}`,
    })),
  );
  const [editingMaterialKey, setEditingMaterialKey] = useState<string | null>(
    null,
  );
  const [materialName, setMaterialName] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createdLessonId, setCreatedLessonId] = useState<number | null>(null);
  const inputId = useMemo(() => `lesson-materials-${moduleId}`, [moduleId]);

  useEffect(
    () => () => {
      if (coverPreviewUrlRef.current)
        URL.revokeObjectURL(coverPreviewUrlRef.current);
    },
    [],
  );

  function selectCover(file?: File) {
    if (!file) return;
    if (!allowedCoverTypes.includes(file.type)) {
      setError('Use uma imagem JPEG, PNG ou WebP para a capa.');
      if (coverInputRef.current) coverInputRef.current.value = '';
      return;
    }
    if (file.size < 1 || file.size > maximumCoverSize) {
      setError('A imagem de capa deve ter até 5 MB e não pode estar vazia.');
      if (coverInputRef.current) coverInputRef.current.value = '';
      return;
    }
    setError('');
    if (coverPreviewUrlRef.current)
      URL.revokeObjectURL(coverPreviewUrlRef.current);
    const previewUrl = URL.createObjectURL(file);
    coverPreviewUrlRef.current = previewUrl;
    setCoverPreviewUrl(previewUrl);
    setCoverImageFile(file);
    setCoverUploadPath(null);
  }

  async function uploadCover(file: File, contentId: number) {
    const response = await fetch('/api/admin/course-images/upload-url', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        kind: 'content',
        id: contentId,
        contentType: file.type,
        sizeBytes: file.size,
      }),
    });
    const upload = (await response
      .json()
      .catch(() => ({}))) as CourseImageUploadDto & { message?: string };
    if (!response.ok)
      throw new Error(
        upload.message ?? 'Não foi possível preparar o envio da capa.',
      );
    const { error: storageError } = await createSupabaseBrowserClient()
      .storage.from(imageBucket)
      .uploadToSignedUrl(upload.path, upload.token, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });
    if (storageError)
      throw new Error('Não foi possível enviar a capa. Tente novamente.');
    return upload.path;
  }

  const editingMaterial = materials.find(
    (material) => material.key === editingMaterialKey,
  );

  function resetMaterialEditor() {
    setEditingMaterialKey(null);
    setMaterialName('');
    setMaterialDescription('');
    setMaterialFile(null);
  }

  function startNewMaterial() {
    setError('');
    setMaterialName('');
    setMaterialDescription('');
    setMaterialFile(null);
    setEditingMaterialKey(`new-${Date.now()}-${Math.random()}`);
  }

  function startEditingMaterial(material: MaterialDraft) {
    setError('');
    setMaterialName(material.name);
    setMaterialDescription(material.description);
    setMaterialFile(null);
    setEditingMaterialKey(material.key);
  }

  function saveMaterialDraft() {
    const name = materialName.trim();
    if (!name) {
      setError('Informe o nome do material.');
      return;
    }
    if (name.length > 240) {
      setError('O nome do material deve ter até 240 caracteres.');
      return;
    }
    if (materialDescription.trim().length > 500) {
      setError('A descrição do material deve ter até 500 caracteres.');
      return;
    }
    if (materialFile && materialFile.size === 0) {
      setError('O arquivo selecionado está vazio. Escolha outro arquivo.');
      return;
    }
    if (materialFile && materialFile.size > maximumFileSize) {
      setError(`${materialFile.name} excede o limite de 50 MB por arquivo.`);
      return;
    }
    if (!editingMaterialKey) return;

    setError('');
    if (editingMaterial) {
      setMaterials((current) =>
        current.map((material) =>
          material.key === editingMaterialKey
            ? {
                ...material,
                pendingChanges: true,
                ...(materialFile
                  ? {
                      id: undefined,
                      file: materialFile,
                      uploadPath: undefined,
                      mimeType: materialFile.type || 'application/octet-stream',
                      sizeBytes: materialFile.size,
                    }
                  : {}),
                name,
                description: materialDescription.trim(),
              }
            : material,
        ),
      );
    } else if (materialFile) {
      setMaterials((current) => [
        ...current,
        {
          key: editingMaterialKey,
          pendingChanges: true,
          name,
          description: materialDescription.trim(),
          mimeType: materialFile.type || 'application/octet-stream',
          sizeBytes: materialFile.size,
          position: current.length,
          file: materialFile,
        },
      ]);
    } else {
      setError('Selecione o arquivo do novo material.');
      return;
    }
    resetMaterialEditor();
  }

  function moveMaterial(index: number, direction: -1 | 1) {
    setMaterials((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex]!, next[index]!];
      return next.map((item, position) => ({ ...item, position }));
    });
  }

  async function uploadMaterial(file: File, contentId: number) {
    const response = await fetch('/api/admin/course-materials/upload-url', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        courseId,
        moduleId,
        contentId,
        contentType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
      }),
    });
    const upload = (await response
      .json()
      .catch(() => ({}))) as CourseMaterialUploadDto & { message?: string };
    if (!response.ok)
      throw new Error(
        upload.message ?? 'Não foi possível preparar o envio do anexo.',
      );
    const { error: storageError } = await createSupabaseBrowserClient()
      .storage.from(materialBucket)
      .uploadToSignedUrl(upload.path, upload.token, file, {
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false,
      });
    if (storageError)
      throw new Error(`Não foi possível enviar ${file.name}. Tente novamente.`);
    return upload.path;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingMaterialKey) {
      setError('Salve ou cancele a edição do material antes de salvar a aula.');
      return;
    }
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const fields = {
      title: String(form.get('title') ?? ''),
      description: String(form.get('description') ?? ''),
      body,
      videoUrl: String(form.get('videoUrl') ?? '').trim() || null,
    };
    try {
      if (!lesson?.imagePath && !coverImageFile) {
        throw new Error('Adicione uma imagem de capa para esta aula.');
      }
      const invalidDescription = materials.find(
        (item) => item.description.trim().length > 500,
      );
      if (invalidDescription)
        throw new Error(
          `A descrição de “${invalidDescription.name}” deve ter até 500 caracteres.`,
        );
      let contentId = lesson?.id ?? createdLessonId ?? undefined;
      if (!contentId) {
        const response = await fetch(
          `/api/admin/courses/${courseId}/modules/${moduleId}/lessons`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(fields),
          },
        );
        const result = (await response
          .json()
          .catch(() => ({}))) as ManagedLessonDto & { message?: string };
        if (!response.ok)
          throw new Error(result.message ?? 'Não foi possível criar a aula.');
        contentId = result.id;
        setCreatedLessonId(result.id);
      }
      if (!contentId)
        throw new Error('Não foi possível identificar a aula salva.');

      const imagePath = coverImageFile
        ? coverUploadPath ?? (await uploadCover(coverImageFile, contentId))
        : lesson?.imagePath;
      if (coverImageFile && imagePath) setCoverUploadPath(imagePath);

      const prepared = await Promise.all(
        materials.map(async (item, position) => ({
          ...(item.id ? { id: item.id } : {}),
          name: item.name,
          description: item.description,
          mimeType: item.mimeType,
          sizeBytes: item.sizeBytes,
          position,
          ...(item.file
            ? { uploadPath: await uploadMaterial(item.file, contentId!) }
            : item.uploadPath
              ? { uploadPath: item.uploadPath }
              : {}),
        })),
      );
      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${contentId}`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            ...fields,
            imagePath,
            materials: prepared,
            status: 'published',
          }),
        },
      );
      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!response.ok)
        throw new Error(
          result.message ?? 'Não foi possível salvar as alterações da aula.',
        );
      router.push(returnTo);
      router.refresh();
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar a aula.';
      setError(
        createdLessonId || lesson
          ? message
          : `${message} Se a aula já foi criada, salve novamente para continuar o envio dos anexos.`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={(event) => void submit(event)}>
      <label htmlFor="title">Título da aula</label>
      <input
        id="title"
        name="title"
        required
        maxLength={180}
        defaultValue={lesson?.title ?? ''}
      />
      <section className={styles.coverField} aria-labelledby="cover-title">
        <label id="cover-title" htmlFor="lesson-cover">
          Capa da aula <span>Obrigatória</span>
        </label>
        <div className={styles.coverPreview}>
          {coverPreviewUrl || lesson?.imageUrl ? (
            <Image
              src={coverPreviewUrl ?? lesson!.imageUrl!}
              alt="Prévia da capa da aula"
              fill
              unoptimized={Boolean(coverPreviewUrl)}
              sizes="380px"
            />
          ) : (
            <span>Prévia da capa</span>
          )}
        </div>
        <input
          ref={coverInputRef}
          id="lesson-cover"
          className={styles.fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          required={!lesson?.imagePath && !coverImageFile}
          aria-describedby="lesson-cover-hint"
          onChange={(event) =>
            selectCover(event.currentTarget.files?.[0] ?? undefined)
          }
        />
        <label className={styles.coverButton} htmlFor="lesson-cover">
          {coverImageFile ? 'Trocar imagem selecionada' : 'Escolher imagem'}
        </label>
        <p id="lesson-cover-hint" className={styles.coverHint}>
          JPEG, PNG ou WebP · até 5 MB · proporção recomendada 16:9.
        </p>
        {coverImageFile && (
          <span className={styles.coverHint}>
            Selecionada: {coverImageFile.name}
          </span>
        )}
      </section>
      <label htmlFor="description">
        Descrição <span>Opcional</span>
      </label>
      <textarea
        id="description"
        name="description"
        maxLength={20000}
        rows={3}
        defaultValue={lesson?.description ?? ''}
      />
      <label htmlFor="videoUrl">
        Vídeo do YouTube <span>Opcional</span>
      </label>
      <input
        id="videoUrl"
        name="videoUrl"
        type="url"
        maxLength={2048}
        placeholder="https://youtu.be/..."
        defaultValue={lesson?.videoUrl ?? ''}
      />
      <label htmlFor="lesson-body-editor">
        Conteúdo da aula{' '}
        <span>Formate o texto; links seguros são exibidos no aluno</span>
      </label>
      <RichTextEditor value={body} onChange={setBody} />
      <p className={styles.hint}>
        Selecione um trecho para aplicar negrito, itálico ou sublinhado. Use
        título e subtítulo para destacar seções.
      </p>

      <section className={styles.section} aria-labelledby="materials-title">
        <div className={styles.materialsHeading}>
          <div>
            <h2 id="materials-title">Materiais complementares</h2>
            <p className={styles.hint}>
              Organize os anexos da aula. Qualquer extensão é aceita, inclusive
              .ntsl; novos arquivos podem ter até 50 MB.
            </p>
          </div>
          <button
            className={styles.materialPrimary}
            type="button"
            disabled={busy || Boolean(editingMaterialKey)}
            onClick={startNewMaterial}
          >
            + Adicionar material
          </button>
        </div>
        {materials.length ? (
          <div className={styles.materials}>
            {materials.map((item, index) => (
              <article
                className={`${styles.material} ${editingMaterialKey === item.key ? styles.materialSelected : ''}`}
                key={item.key}
              >
                <div className={styles.materialSummary}>
                  <strong>{item.name}</strong>
                  {item.description && <p>{item.description}</p>}
                  <span className={styles.materialMeta}>
                    {item.file ? item.file.name : item.name} ·{' '}
                    {formatSize(item.sizeBytes)}
                    {item.id && !item.pendingChanges
                      ? ' · salvo'
                      : item.id
                        ? ' · alterações pendentes'
                        : ' · novo, ainda não salvo'}
                  </span>
                </div>
                <div className={styles.materialActions}>
                  <button
                    className={styles.remove}
                    type="button"
                    aria-label="Mover material para cima"
                    disabled={
                      busy || Boolean(editingMaterialKey) || index === 0
                    }
                    onClick={() => moveMaterial(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    className={styles.remove}
                    type="button"
                    aria-label="Mover material para baixo"
                    disabled={
                      busy ||
                      Boolean(editingMaterialKey) ||
                      index === materials.length - 1
                    }
                    onClick={() => moveMaterial(index, 1)}
                  >
                    ↓
                  </button>
                  <button
                    className={styles.materialButton}
                    type="button"
                    disabled={busy || Boolean(editingMaterialKey)}
                    onClick={() => startEditingMaterial(item)}
                  >
                    Editar
                  </button>
                  <button
                    className={styles.materialButton}
                    type="button"
                    disabled={busy || Boolean(editingMaterialKey)}
                    onClick={() =>
                      setMaterials((current) =>
                        current
                          .filter((_, itemIndex) => itemIndex !== index)
                          .map((material, position) => ({
                            ...material,
                            position,
                          })),
                      )
                    }
                  >
                    Remover
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            Ainda não há materiais. Você pode salvar a aula sem anexos.
          </div>
        )}
        <p className={styles.hint}>
          Salvar um material conclui sua edição nesta tela. As alterações serão
          persistidas junto com a aula ao usar o botão “Salvar” no final.
        </p>
        {editingMaterialKey && (
          <div className={styles.materialEditor}>
            <h3>{editingMaterial ? 'Editando material' : 'Novo material'}</h3>
            <label htmlFor="material-name">Nome do material *</label>
            <input
              id="material-name"
              value={materialName}
              maxLength={240}
              onChange={(event) => setMaterialName(event.target.value)}
              required
            />
            <label htmlFor="material-description">
              Descrição <span>Opcional</span>
            </label>
            <input
              id="material-description"
              value={materialDescription}
              maxLength={500}
              onChange={(event) => setMaterialDescription(event.target.value)}
            />
            <label htmlFor={inputId}>
              {editingMaterial ? 'Arquivo atual' : 'Arquivo *'}
            </label>
            {editingMaterial && !materialFile && (
              <p className={styles.materialMeta}>
                {editingMaterial.name} · {formatSize(editingMaterial.sizeBytes)}
                {' · '}o arquivo será mantido se nenhum substituto for
                selecionado.
              </p>
            )}
            <input
              id={inputId}
              type="file"
              disabled={busy}
              aria-describedby="material-file-hint"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0] ?? null;
                setMaterialFile(file);
                if (file) setMaterialName(file.name.slice(0, 240));
              }}
            />
            <span id="material-file-hint" className={styles.materialMeta}>
              {materialFile
                ? `Selecionado: ${materialFile.name} · ${formatSize(materialFile.size)}`
                : editingMaterial
                  ? 'Escolha um arquivo apenas se quiser substituir o anexo atual.'
                  : 'Selecione o arquivo que será adicionado à aula. Limite de 50 MB.'}
            </span>
            <div className={styles.materialEditorActions}>
              <button
                className={styles.materialButton}
                type="button"
                disabled={busy}
                onClick={resetMaterialEditor}
              >
                Cancelar
              </button>
              <button
                className={styles.materialPrimary}
                type="button"
                disabled={busy}
                onClick={saveMaterialDraft}
              >
                Salvar material
              </button>
            </div>
          </div>
        )}
      </section>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <button className={styles.button} type="submit" disabled={busy}>
          {busy ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}
