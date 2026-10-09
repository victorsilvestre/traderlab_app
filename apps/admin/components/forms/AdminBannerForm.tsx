'use client';

import Link from 'next/link';
import { Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { HomeBannerImageUploadDto, ManagedHomeBannerDto } from '@traderlab/contracts';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';
import { AdminBackLink } from '../navigation/AdminBackLink';
import styles from './AdminBannerForm.module.css';

const bucket = process.env.NEXT_PUBLIC_COURSE_IMAGES_BUCKET ?? 'traderlab-course-images';
const maximumFileSize = 5 * 1024 * 1024;
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

export function AdminBannerForm({ returnTo, activeCount, banner }: {
  returnTo: string;
  activeCount: number;
  banner?: ManagedHomeBannerDto;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(banner?.imageUrl ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const editing = Boolean(banner);
  const atLimit = !editing && activeCount >= 5;

  useEffect(() => () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); }, []);

  function selectFile(next?: File) {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setFile(null); setPreview(banner?.imageUrl ?? ''); setError('');
    if (!next) return;
    if (!allowedTypes.includes(next.type)) { setError('Escolha uma imagem JPEG, PNG ou WebP.'); if (inputRef.current) inputRef.current.value = ''; return; }
    if (next.size > maximumFileSize) { setError('A imagem deve ter até 5 MB.'); if (inputRef.current) inputRef.current.value = ''; return; }
    const url = URL.createObjectURL(next);
    previewUrl.current = url;
    setFile(next); setPreview(url);
  }

  async function uploadImage() {
    if (!file) return banner?.imagePath ?? '';
    const response = await fetch('/api/admin/banners/upload-url', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contentType: file.type, sizeBytes: file.size }),
    });
    const upload = await response.json().catch(() => ({})) as HomeBannerImageUploadDto & { message?: string };
    if (!response.ok) throw new Error(upload.message ?? 'Não foi possível preparar o envio da imagem.');
    const { error: storageError } = await createSupabaseBrowserClient().storage.from(bucket).uploadToSignedUrl(upload.path, upload.token, file, {
      contentType: file.type, cacheControl: '3600', upsert: false,
    });
    if (storageError) throw new Error('Não foi possível enviar a imagem. Tente novamente.');
    return upload.path;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const fields = new FormData(event.currentTarget);
      const imagePath = await uploadImage();
      const response = await fetch(editing ? `/api/admin/banners/${banner!.id}` : '/api/admin/banners', {
        method: editing ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          internalName: String(fields.get('internalName') ?? ''),
          description: String(fields.get('description') ?? ''), eyebrowText: String(fields.get('eyebrowText') ?? ''),
          overlayText: String(fields.get('overlayText') ?? ''), imagePath,
          destinationUrl: String(fields.get('destinationUrl') ?? ''), altText: String(fields.get('altText') ?? ''),
        }),
      });
      const result = await response.json().catch(() => ({})) as ManagedHomeBannerDto & { message?: string };
      if (!response.ok) throw new Error(result.message ?? `Não foi possível ${editing ? 'salvar as alterações' : 'cadastrar o banner'}.`);
      router.push(returnTo); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível salvar o banner.'); }
    finally { setBusy(false); }
  }

  return (
    <section className={styles.page} aria-labelledby="banner-form-title">
      <AdminBackLink href={returnTo} />
      <header className={styles.heading}><h1 id="banner-form-title">{editing ? 'Editar banner' : 'Novo banner'}</h1><p>{editing ? 'Revise as informações exibidas e atualize o banner.' : 'Cadastre a imagem e os textos que serão usados na vitrine.'}</p></header>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <form className={styles.form} onSubmit={submit}>
        <fieldset className={styles.group}>
          <legend>Informações do sistema</legend>
          <label>Nome interno<input name="internalName" required maxLength={180} autoComplete="off" defaultValue={banner?.internalName ?? ''} /></label>
          <label>Link de destino <span>Opcional</span><input name="destinationUrl" type="url" placeholder="https://exemplo.com" maxLength={2048} defaultValue={banner?.destinationUrl ?? ''} /><small>O link será aberto em uma nova aba.</small></label>
          <label>Texto alternativo<input name="altText" required maxLength={500} defaultValue={banner?.altText ?? ''} /><small>Descreva a imagem para pessoas que usam leitor de tela.</small></label>
          <div className={styles.imageSection}>
            <div className={styles.labelRow}><span>Imagem do banner <b>{editing ? 'Opcional para manter a atual' : 'Obrigatória'}</b></span><small>JPEG, PNG ou WebP · até 5 MB</small></div>
            <div className={`${styles.preview} ${preview ? styles.hasImage : ''}`} style={preview ? { backgroundImage: `url("${preview}")` } : undefined} role="img" aria-label={preview ? 'Prévia da imagem do banner' : 'Prévia da área do banner'}>
              {!preview && <span>A prévia seguirá esta área na página inicial</span>}
            </div>
            <input ref={inputRef} className={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp" required={!editing && !file} onChange={(event) => selectFile(event.currentTarget.files?.[0])} />
            {file && <button className={styles.replaceButton} type="button" onClick={() => inputRef.current?.click()}>Escolher outra imagem</button>}
            <small>Use 3:1 (referência: 1440 × 480 px). Esse formato preenche a prévia, a miniatura e a vitrine sem faixas vazias ou cortes.</small>
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Informações visualizadas pelo usuário</legend>
          <label>Chamada curta (kicker) <span>Opcional</span><input name="eyebrowText" maxLength={180} defaultValue={banner?.eyebrowText ?? ''} /><small>Texto pequeno acima do título, como “Aprenda com método”.</small></label>
          <label>Texto sobre a imagem <span>Opcional</span><input name="overlayText" maxLength={500} defaultValue={banner?.overlayText ?? ''} /><small>É o título principal que aparece sobre a imagem. Deixe vazio se ele já fizer parte da arte.</small></label>
          <label>Texto de apoio <span>Opcional</span><textarea name="description" rows={3} maxLength={20000} defaultValue={banner?.description ?? ''} /><small>Complementa o texto sobre a imagem na vitrine.</small></label>
        </fieldset>

        {!editing && <div className={styles.note} role={atLimit ? 'alert' : undefined}>{atLimit ? 'Os cinco banners ativos já estão ocupando a vitrine. Inative um banner antes de cadastrar outro.' : `Ao salvar, o banner será ativado. Há ${5 - activeCount} ${5 - activeCount === 1 ? 'vaga disponível' : 'vagas disponíveis'}.`}</div>}
        <div className={styles.actions}>
          <Link href={returnTo} aria-label={`Cancelar ${editing ? 'edição' : 'cadastro'}`} data-tooltip="Cancelar"><X aria-hidden="true" size={19} strokeWidth={1.8} /></Link>
          <button type="submit" disabled={busy || atLimit || (!editing && !file)} aria-label={busy ? 'Salvando banner' : 'Salvar banner'} data-tooltip={busy ? 'Salvando…' : atLimit ? 'Inative um banner antes de cadastrar' : 'Salvar'}>
            {busy ? <span className={styles.spinner} aria-hidden="true" /> : <Save aria-hidden="true" size={19} strokeWidth={1.8} />}
          </button>
        </div>
      </form>
    </section>
  );
}
