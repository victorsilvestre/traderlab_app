'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';
import { completeAuthCallback } from '../../lib/authentication/completeAuthCallback';

export function AuthCallback() {
  const [error, setError] = useState('');

  useEffect(() => {
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

      window.location.replace(result.next);
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
            <h1>Não foi possível validar o link</h1>
            <p role="alert">{error}</p>
            <Link
              className="primary-button link-button"
              href="/email-confirmation"
            >
              Solicitar outro link
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
