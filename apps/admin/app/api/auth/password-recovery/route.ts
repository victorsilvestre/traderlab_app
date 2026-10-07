import { NextResponse } from 'next/server';
import { isSameOrigin } from '../../../../lib/authentication/requestOrigin';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { message: 'Origem não autorizada.' },
      { status: 403 },
    );
  }
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
  } | null;
  if (!body || typeof body.email !== 'string' || !body.email.trim()) {
    return NextResponse.json(
      { message: 'Informe seu e-mail.' },
      { status: 400 },
    );
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, '')}/authentication/password-recovery`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: body.email.trim(),
          destination: 'admin',
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      },
    );
    const result = await response.json().catch(() => ({}));
    return NextResponse.json(result, {
      status: response.status,
      headers: { 'cache-control': 'no-store' },
    });
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível enviar as instruções agora.' },
      { status: 503 },
    );
  }
}
