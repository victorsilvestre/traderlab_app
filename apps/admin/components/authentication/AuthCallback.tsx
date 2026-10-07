'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';
import styles from './AuthCallback.module.css';

export function AuthCallback() {
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function complete() {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      const code = url.searchParams.get('code');
      const accessToken = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');
      const providerError =
        url.searchParams.get('error_description') ??
        hash.get('error_description');
      if (providerError)
        throw new Error('O link expirou ou não é válido. Solicite outro link.');
      if (!code && !(accessToken && refreshToken)) {
        throw new Error(
          'O link não contém os dados necessários. Solicite outro link.',
        );
      }

      const supabase = createSupabaseBrowserClient();
      const result = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : await supabase.auth.setSession({
            access_token: accessToken!,
            refresh_token: refreshToken!,
          });
      if (result.error)
        throw new Error('Não foi possível validar o link. Solicite outro.');
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session)
        throw new Error('O link expirou. Solicite outro.');
      if (!active) return;
      if (url.searchParams.get('next') === '/password-reset') {
        window.location.replace('/password-reset');
        return;
      }
      const { error: signOutError } = await supabase.auth.signOut({
        scope: 'local',
      });
      if (signOutError)
        throw new Error('Link confirmado. Saia da sessão e entre novamente.');
      window.location.replace('/sign-in?confirmed=1');
    }

    void complete().catch((cause: unknown) => {
      if (active)
        setError(
          cause instanceof Error
            ? cause.message
            : 'Não foi possível validar o link.',
        );
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <span className={styles.mark} aria-hidden="true">
          T
        </span>
        <p className={styles.eyebrow}>TraderLab / Gestão</p>
        <h1>
          {error ? 'Não foi possível validar o link' : 'Validando seu acesso'}
        </h1>
        {error ? (
          <>
            <p role="alert">{error}</p>
            <Link href="/password-recovery">Solicitar novo link</Link>
          </>
        ) : (
          <p role="status">Aguarde enquanto concluímos a validação.</p>
        )}
      </div>
    </main>
  );
}
