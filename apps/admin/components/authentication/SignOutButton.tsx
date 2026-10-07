'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function signOut() {
    setBusy(true);
    setError('');
    try {
      const { error: signOutError } =
        await createSupabaseBrowserClient().auth.signOut({ scope: 'local' });
      if (signOutError) throw signOutError;
      router.replace('/sign-in');
      router.refresh();
    } catch {
      setError('Não foi possível sair. Tente novamente.');
      setBusy(false);
    }
  }

  return (
    <span>
      <button type="button" onClick={signOut} disabled={busy}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 17l5-5-5-5M15 12H3" />
          <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
        </svg>
        {busy ? 'Saindo…' : 'Sair'}
      </button>
      {error && <small role="alert">{error}</small>}
    </span>
  );
}
