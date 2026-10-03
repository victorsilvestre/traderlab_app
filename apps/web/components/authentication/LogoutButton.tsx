'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { completeSignOut } from '../../lib/authentication/completeSignOut';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const supabase = createSupabaseBrowserClient();

  async function handleSignOut() {
    if (busy) return;
    setBusy(true);
    setError('');

    try {
      await completeSignOut(supabase.auth, router);
    } catch {
      setError('Não foi possível sair agora. Tente novamente.');
      setBusy(false);
    }
  }

  return (
    <div className="home-header-actions">
      <button
        className="logout-button"
        type="button"
        onClick={handleSignOut}
        disabled={busy}
        aria-busy={busy}
      >
        {busy ? 'Saindo…' : 'Sair'}
      </button>
      {error && (
        <span className="logout-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
