import { createBrowserClient } from '@supabase/ssr';
import type { SignInDto } from '@traderlab/contracts';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type SignInBody = { email?: unknown; password?: unknown };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SignInBody | null;
  if (
    !body ||
    typeof body.email !== 'string' ||
    typeof body.password !== 'string' ||
    !body.email.trim() ||
    !body.password
  ) {
    return NextResponse.json({ message: 'Informe seu e-mail e sua senha.' }, { status: 400 });
  }

  let response: Response;
  try {
    response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, '')}/authentication/sign-in`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: body.email.trim(), password: body.password }),
        cache: 'no-store',
      },
    );
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível conectar ao serviço de login. Tente novamente.' },
      { status: 503 },
    );
  }

  const result = (await response.json().catch(() => ({}))) as
    | SignInDto
    | { message?: string };
  if (!response.ok) {
    return NextResponse.json(
      {
        message:
          'message' in result && typeof result.message === 'string'
            ? result.message
            : 'Não foi possível entrar. Confira seus dados e tente novamente.',
      },
      { status: response.status },
    );
  }

  if (!('session' in result) || !result.session?.accessToken || !result.session.refreshToken) {
    return NextResponse.json(
      { message: 'O serviço de login retornou uma resposta inválida. Tente novamente.' },
      { status: 502 },
    );
  }

  const cookieStore = await cookies();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      isSingleton: false,
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const authStorage = supabase.auth as unknown as {
    storageKey: string;
    storage: { setItem(key: string, value: string): Promise<void> };
  };
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = result.session.expiresAt ?? now + 3600;
  const session = {
    access_token: result.session.accessToken,
    refresh_token: result.session.refreshToken,
    expires_in: Math.max(expiresAt - now, 0),
    expires_at: expiresAt,
    token_type: 'bearer',
    user: {
      id: result.user.id,
      aud: 'authenticated',
      role: 'authenticated',
      email: body.email.trim(),
      phone: result.user.phone,
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { name: result.user.name, phone: result.user.phone },
    },
  };

  try {
    await authStorage.storage.setItem(authStorage.storageKey, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to persist the Supabase SSR session cookie.', error);
    return NextResponse.json(
      { message: 'Não foi possível salvar sua sessão. Tente entrar novamente.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ user: result.user });
}
