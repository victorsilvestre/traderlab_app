import { getSafeReturnPath } from './returnPath';

type Navigation = {
  replace(path: string): void;
  refresh(): void;
};

export async function completeSignIn(
  credentials: { email: string; password: string },
  navigation: Navigation,
  returnTo = '/',
): Promise<void> {
  const response = await fetch('/api/auth/sign-in', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const result = (await response.json().catch(() => ({}))) as {
    message?: string;
    user?: { phone?: string };
  };
  if (!response.ok) {
    throw new Error(result.message ?? 'Não foi possível entrar. Tente novamente.');
  }

  navigation.replace(result.user?.phone?.trim() ? getSafeReturnPath(returnTo) : '/profile?complete=1');
  navigation.refresh();
}
