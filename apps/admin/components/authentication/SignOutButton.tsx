'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
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
        <LogOut aria-hidden="true" size={16} strokeWidth={1.8} />
        {busy ? 'Saindo…' : 'Sair'}
      </button>
      {error && <small role="alert">{error}</small>}
    </span>
  );
}
