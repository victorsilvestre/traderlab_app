'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';
import styles from './SessionState.module.css';

export function AccessDenied() {
  const [cleared, setCleared] = useState(false);
  const [error, setError] = useState(false);
  async function clearSession() {
    setError(false);
    try {
      const { error: signOutError } =
        await createSupabaseBrowserClient().auth.signOut({ scope: 'local' });
      if (signOutError) throw signOutError;
      setCleared(true);
    } catch {
      setError(true);
    }
  }
  useEffect(() => {
    void (async () => {
      try {
        const result = await createSupabaseBrowserClient().auth.signOut({
          scope: 'local',
        });
        if (result.error) setError(true);
        else setCleared(true);
      } catch {
        setError(true);
      }
    })();
  }, []);
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>TraderLab / Gestão</p>
        <h1>Este perfil não pode entrar aqui.</h1>
        <p>
          O ambiente de gestão está disponível para mentores e administradores.
        </p>
        {error && (
          <p role="alert">
            Não foi possível encerrar esta sessão. Tente novamente.
          </p>
        )}
        {error ? (
          <button type="button" onClick={clearSession}>
            Tentar novamente
          </button>
        ) : cleared ? (
          <Link href="/sign-in">Voltar para a entrada</Link>
        ) : (
          <p role="status">Encerrando a sessão…</p>
        )}
      </section>
    </main>
  );
}
