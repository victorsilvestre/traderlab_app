import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AuthForm, type AuthFormMode } from '../components/forms/AuthForm';
import { AuthShell } from '../components/authentication/AuthShell';
import { getCurrentUserProfile } from './authentication/getCurrentUserProfile';
import { getSafeReturnPath } from './authentication/returnPath';

export async function renderAuthenticationPage(
  mode: AuthFormMode,
  requestedReturnPath?: string | null,
): Promise<ReactNode> {
  const returnTo = getSafeReturnPath(requestedReturnPath);
  const { authenticated, profile } = await getCurrentUserProfile();
  if (authenticated && profile && mode !== 'reset') {
    redirect(profile.phone.trim() ? returnTo : '/profile?complete=1');
  }

  return (
    <AuthShell>
      <AuthForm
        mode={mode}
        returnTo={returnTo}
        notice={
          authenticated && !profile && mode === 'sign-in'
            ? 'Não conseguimos validar sua sessão agora. Você pode tentar novamente ou entrar de novo.'
            : undefined
        }
      />
    </AuthShell>
  );
}
