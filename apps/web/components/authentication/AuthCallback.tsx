'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';
import { completeAuthCallback } from '../../lib/authentication/completeAuthCallback';

export function AuthCallback() {
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let active = true;
    const supabase = createSupabaseBrowserClient();

    async function completeCallback() {
      const result = await completeAuthCallback(
        supabase.auth,
        window.location.href,
      );

      if (!active) return;
      if (result.error) {
        setError(result.error);
        return;
      }
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const providers = session?.user.app_metadata?.providers;
      const isGoogle = session?.user.app_metadata?.provider === 'google' ||
        (Array.isArray(providers) && providers.includes('google'));
      let destination = result.next;
      if (isGoogle && session?.access_token) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/authentication/external-sign-in`, {
            method: 'POST',
            headers: { authorization: `Bearer ${session.access_token}` },
            cache: 'no-store',
          });
          const completion = await response.json();
          if (!response.ok) throw new Error(completion.message ?? 'Não foi possível concluir seu acesso. Tente novamente.');
          if (completion.requiresPhone) destination = '/profile?complete=1';
        } catch (cause) {
          if (active) setError(cause instanceof Error ? cause.message : 'Não foi possível concluir seu acesso. Tente novamente.');
          return;
        }
      }
      if (active) window.location.replace(destination);
    }

    void completeCallback();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="callback-page">
      <div className="callback-card">
        <span className="brand-symbol" aria-hidden="true">
          T
        </span>
        {error ? (
          <>
            <h1>Não foi possível concluir o acesso</h1>
            <p role="alert">{error}</p>
            <Link
              className="primary-button link-button"
              href="/sign-in"
            >
              Voltar para o login
            </Link>
          </>
        ) : (
          <>
            <h1>Validando seu acesso</h1>
            <p>Aguarde enquanto confirmamos o link enviado para seu e-mail.</p>
            <span className="loading-mark" aria-label="Carregando" />
          </>
        )}
      </div>
    </main>
  );
}
