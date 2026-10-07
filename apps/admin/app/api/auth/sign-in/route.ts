import type { SignInDto } from '@traderlab/contracts';
import { NextResponse } from 'next/server';
import { isSameOrigin } from '../../../../lib/authentication/requestOrigin';
import { persistSession } from '../../../../lib/authentication/persistSession';

type Credentials = { email?: unknown; password?: unknown };

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { message: 'Origem não autorizada.' },
      { status: 403 },
    );
  }
  const body = (await request.json().catch(() => null)) as Credentials | null;
  if (
    !body ||
    typeof body.email !== 'string' ||
    typeof body.password !== 'string' ||
    !body.email.trim() ||
    !body.password
  ) {
    return NextResponse.json(
      { message: 'Informe seu e-mail e sua senha.' },
      { status: 400 },
    );
  }

  let response: Response;
  try {
    response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, '')}/authentication/workspace/sign-in`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: body.email.trim(),
          password: body.password,
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      },
    );
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível conectar ao serviço de login.' },
      { status: 503 },
    );
  }

  const result = (await response.json().catch(() => ({}))) as
    SignInDto | { message?: string };
  if (!response.ok) {
    return NextResponse.json(
      {
        message:
          'message' in result && typeof result.message === 'string'
            ? result.message
            : 'Não foi possível entrar. Tente novamente.',
      },
      { status: response.status },
    );
  }
  if (
    !('session' in result) ||
    !result.session?.accessToken ||
    !result.session.refreshToken ||
    (result.user.role !== 'mentor' && result.user.role !== 'administrator')
  ) {
    return NextResponse.json(
      { message: 'Resposta de login inválida.' },
      { status: 502 },
    );
  }

  try {
    await persistSession(result, body.email.trim());
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível salvar sua sessão.' },
      { status: 500 },
    );
  }
  return NextResponse.json(
    { user: result.user },
    { headers: { 'cache-control': 'no-store' } },
  );
}
