import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AuthForm, type AuthFormMode } from '../components/authentication/AuthForm';
import { AuthShell } from '../components/authentication/AuthShell';
import { createSupabaseServerClient } from './supabase/server';

export async function renderAuthenticationPage(
  mode: AuthFormMode,
): Promise<ReactNode> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.sub && mode !== 'reset') redirect('/');

  return (
    <AuthShell>
      <AuthForm mode={mode} />
    </AuthShell>
  );
}

