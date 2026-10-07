import { NextResponse } from 'next/server';
import { isSameOrigin } from '../../../../lib/authentication/requestOrigin';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

type ResetBody = { password?: unknown; passwordConfirmation?: unknown };

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { message: 'Origem não autorizada.' },
      { status: 403 },
    );
  }
  const body = (await request.json().catch(() => null)) as ResetBody | null;
  if (
    !body ||
    typeof body.password !== 'string' ||
    typeof body.passwordConfirmation !== 'string'
  ) {
    return NextResponse.json(
      { message: 'Informe e confirme a nova senha.' },
      { status: 400 },
    );
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      return NextResponse.json(
        { message: 'O link expirou. Solicite outro.' },
        { status: 401 },
      );
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, '')}/authentication/password-reset`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
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
      { message: 'Não foi possível atualizar a senha agora.' },
      { status: 503 },
    );
  }
}
