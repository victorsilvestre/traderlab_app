'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfileDetailsDto } from '@traderlab/contracts';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';
import styles from './ProfileScreen.module.css';

const bucket =
  process.env.NEXT_PUBLIC_PROFILE_AVATARS_BUCKET ?? 'traderlab-profile-avatars';

export function ProfileForm({ profile, completionRequired = false }: { profile: UserProfileDetailsDto; completionRequired?: boolean }) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(formatPhone(profile.phone));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    error: boolean;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toLocaleUpperCase('pt-BR') || 'TL';
  const avatarSrc = preview ?? (!avatarFailed ? profile.avatarUrl : null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Sua sessão expirou. Entre novamente.');
      }

      let avatarPath: string | undefined;
      if (file) {
        const uploadResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me/profile/avatar-upload`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${session.access_token}`,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              contentType: file.type,
              sizeBytes: file.size,
            }),
          },
        );
        const upload = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(
            upload.message ?? 'Não foi possível preparar o envio da imagem.',
          );
        }

        const { error: storageError } = await supabase.storage
          .from(bucket)
          .uploadToSignedUrl(upload.path, upload.token, file, {
            contentType: file.type,
            upsert: false,
          });
        if (storageError) {
          throw new Error('Não foi possível enviar a imagem. Tente novamente.');
        }
        avatarPath = upload.path as string;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/profile`,
        {
          method: 'PATCH',
          headers: {
            authorization: `Bearer ${session.access_token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(
            completionRequired
              ? { phone }
              : { name, phone, ...(avatarPath ? { avatarPath } : {}) },
          ),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.message ?? 'Não foi possível salvar seu perfil.',
        );
      }

      setMessage({ text: 'Perfil atualizado com sucesso.', error: false });
      setFile(null);
      setAvatarFailed(false);
      if (completionRequired) router.replace('/home');
      else router.refresh();
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar seu perfil.',
        error: true,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={save}>
      <section className={styles.avatarSection} aria-label="Foto do perfil">
        <div className={styles.avatar}>
          {avatarSrc ? (
            <img src={avatarSrc} alt="" onError={() => setAvatarFailed(true)} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className={styles.avatarControls}>
          <strong>Foto de perfil</strong>
          <span>JPEG, PNG ou WebP · até 5 MB</span>
          {!completionRequired && <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => inputRef.current?.click()}
          >
            Escolher imagem
          </button>}
          {!completionRequired && <input
            ref={inputRef}
            className={styles.fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              setAvatarFailed(false);
              setFile(event.target.files?.[0] ?? null);
            }}
          />}
        </div>
      </section>
      <label className={styles.field}>
        <span>Nome</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={120}
          required={!completionRequired}
          autoComplete="name"
          readOnly={completionRequired}
        />
      </label>
      <label className={styles.field}>
        <span>Telefone</span>
        <input
          value={phone}
          onChange={(event) => setPhone(formatPhone(event.target.value))}
          maxLength={20}
          minLength={5}
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder="(00) 00000-0000"
        />
      </label>
      <label className={styles.field}>
        <span>E-mail</span>
        <input
          value={profile.email ?? 'Não informado'}
          readOnly
          aria-describedby="email-help"
        />
        <small id="email-help">
          O e-mail é usado para identificar seus cursos e não pode ser alterado.
        </small>
      </label>
      {message && (
        <p
          className={message.error ? styles.error : styles.success}
          role={message.error ? 'alert' : 'status'}
        >
          {message.text}
        </p>
      )}
      <div className={styles.actions}>
        <button className={styles.primaryButton} type="submit" disabled={busy}>
          {busy ? 'Salvando…' : completionRequired ? 'Salvar e ir para a home' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  );
}

function formatPhone(value: string): string {
  let digits = value.replace(/\D/g, '');
  const hasBrazilCountryCode = digits.length >= 12 && digits.startsWith('55');
  if (hasBrazilCountryCode) digits = digits.slice(2);
  if (digits.length > 11) digits = digits.slice(-11);
  digits = digits.slice(0, 11);
  if (!digits) return '';

  const country = hasBrazilCountryCode ? '+55 ' : '';
  if (digits.length <= 2) return `${country}(${digits}`;
  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);
  if (!number) return `${country}(${areaCode})`;
  if (number.length <= 4) return `${country}(${areaCode}) ${number}`;
  const firstPartLength = number[0] === '9' ? 5 : 4;
  return `${country}(${areaCode}) ${number.slice(0, firstPartLength)}-${number.slice(firstPartLength)}`;
}
