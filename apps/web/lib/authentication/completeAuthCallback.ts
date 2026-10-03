type SessionError = { message: string } | null;

export type AuthCallbackClient = {
  exchangeCodeForSession(code: string): Promise<{ error: SessionError }>;
  setSession(tokens: {
    access_token: string;
    refresh_token: string;
  }): Promise<{ error: SessionError }>;
  getSession(): Promise<{
    data: { session: unknown | null };
    error: SessionError;
  }>;
};

export async function completeAuthCallback(
  auth: AuthCallbackClient,
  href: string,
): Promise<{ next: string; error: string | null }> {
  const url = new URL(href);
  const next = url.searchParams.get('next');
  const safeNext = next?.startsWith('/') && !next.startsWith('//') ? next : '/';
  const hash = new URLSearchParams(url.hash.slice(1));
  const code = url.searchParams.get('code');
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');

  let callbackError =
    url.searchParams.get('error_description') ?? hash.get('error_description');

  if (!callbackError && code) {
    const { error } = await auth.exchangeCodeForSession(code);
    callbackError = error?.message ?? null;
  } else if (!callbackError && accessToken && refreshToken) {
    const { error } = await auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    callbackError = error?.message ?? null;
  }

  const { data, error } = await auth.getSession();
  if (error || !data.session) {
    return {
      next: safeNext,
      error:
        callbackError ??
        error?.message ??
        'O link expirou ou não é válido. Solicite um novo link e tente novamente.',
    };
  }

  return { next: safeNext, error: null };
}
