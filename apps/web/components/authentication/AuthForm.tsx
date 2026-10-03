'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { MessageDto, SignInDto } from '../../lib/api';
import { apiRequest } from '../../lib/api';
import { completeSignIn } from '../../lib/authentication/completeSignIn';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';

export type AuthFormMode =
  'sign-up' | 'sign-in' | 'recovery' | 'resend-confirmation' | 'reset';

const labels: Record<
  Exclude<AuthFormMode, 'reset'>,
  { title: string; description: string }
> = {
  'sign-up': {
    title: 'Crie sua conta',
    description: 'Comece sua jornada de aprendizado no TraderLab.',
  },
  'sign-in': {
    title: 'Que bom ter você de volta',
    description: 'Entre para continuar de onde parou.',
  },
  recovery: {
    title: 'Recupere seu acesso',
    description: 'Enviaremos instruções para o e-mail informado.',
  },
  'resend-confirmation': {
    title: 'Confirme seu e-mail',
    description: 'Informe seu e-mail para receber um novo link de confirmação.',
  },
};

export function AuthForm({ mode }: { mode: AuthFormMode }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const supabase = createSupabaseBrowserClient();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const passwordConfirmation = String(form.get('passwordConfirmation') ?? '');

    try {
      if (mode === 'sign-up') {
        const result = await apiRequest<MessageDto>('/authentication/sign-up', {
          method: 'POST',
          body: JSON.stringify({
            name: String(form.get('name') ?? '').trim(),
            email,
            phone: String(form.get('phone') ?? '').trim(),
            password,
            passwordConfirmation,
          }),
        });
        setMessage(result.message);
      } else if (mode === 'sign-in') {
        const result = await apiRequest<SignInDto>('/authentication/sign-in', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        await completeSignIn(result, supabase.auth, router);
      } else if (mode === 'recovery') {
        const result = await apiRequest<MessageDto>(
          '/authentication/password-recovery',
          { method: 'POST', body: JSON.stringify({ email }) },
        );
        setMessage(result.message);
      } else if (mode === 'resend-confirmation') {
        const result = await apiRequest<MessageDto>(
          '/authentication/email-confirmation',
          { method: 'POST', body: JSON.stringify({ email }) },
        );
        setMessage(result.message);
      } else {
        if (password !== passwordConfirmation) {
          throw new Error('As senhas informadas não coincidem.');
        }
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !data.session) {
          throw new Error(
            'O link expirou ou já foi usado. Solicite uma nova redefinição.',
          );
        }
        const result = await apiRequest<MessageDto>(
          '/authentication/password-reset',
          {
            method: 'POST',
            headers: { authorization: `Bearer ${data.session.access_token}` },
            body: JSON.stringify({ password, passwordConfirmation }),
          },
        );
        await supabase.auth.signOut({ scope: 'local' });
        setMessage(result.message);
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível concluir a solicitação. Tente novamente.',
      );
    } finally {
      setBusy(false);
    }
  }

  const isReset = mode === 'reset';
  const copy = isReset
    ? {
        title: 'Defina uma nova senha',
        description: 'Escolha uma senha com pelo menos 6 caracteres.',
      }
    : labels[mode];

  return (
    <div className="auth-form-wrap">
      <div className="mobile-brand" aria-hidden="true">
        <span className="brand-symbol">T</span> TraderLab
      </div>
      <p className="eyebrow">Sua área de aprendizagem</p>
      <h1>{copy.title}</h1>
      <p className="form-intro">{copy.description}</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === 'sign-up' && (
          <>
            <label htmlFor="name">Nome completo</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={120}
              required
            />
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
            />
            <label htmlFor="phone">Telefone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={30}
              required
            />
          </>
        )}

        {(mode === 'sign-in' ||
          mode === 'recovery' ||
          mode === 'resend-confirmation') && (
          <>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
            />
          </>
        )}

        {(mode === 'sign-in' || mode === 'sign-up' || isReset) && (
          <>
            <div className="label-row">
              <label htmlFor="password">
                {isReset ? 'Nova senha' : 'Senha'}
              </label>
              {mode === 'sign-in' && (
                <Link href="/password-recovery">Esqueceu a senha?</Link>
              )}
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={
                mode === 'sign-in' ? 'current-password' : 'new-password'
              }
              minLength={6}
              maxLength={128}
              required
            />
          </>
        )}

        {(mode === 'sign-up' || isReset) && (
          <>
            <label htmlFor="passwordConfirmation">Confirmar senha</label>
            <input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              minLength={6}
              maxLength={128}
              required
            />
          </>
        )}

        {error && (
          <p className="form-message form-message-error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="form-message form-message-success" role="status">
            {message}
          </p>
        )}

        <button className="primary-button" type="submit" disabled={busy}>
          {busy ? 'Aguarde…' : submitLabel(mode)}
        </button>
      </form>

      <nav className="auth-links" aria-label="Outras opções de acesso">
        {mode === 'sign-in' && (
          <p>
            Não tem uma conta? <Link href="/sign-up">Criar conta</Link>
          </p>
        )}
        {mode === 'sign-in' && (
          <p>
            Precisa confirmar o e-mail?{' '}
            <Link href="/email-confirmation">Reenviar link</Link>
          </p>
        )}
        {mode === 'sign-up' && (
          <p>
            Já tem uma conta? <Link href="/sign-in">Entrar</Link>
          </p>
        )}
        {mode === 'recovery' && (
          <p>
            Lembrou a senha? <Link href="/sign-in">Voltar ao login</Link>
          </p>
        )}
        {mode === 'resend-confirmation' && (
          <p>
            <Link href="/sign-in">Voltar ao login</Link>
          </p>
        )}
        {isReset && (
          <p>
            <Link href="/sign-in">Voltar ao login</Link>
          </p>
        )}
      </nav>
      <p className="security-note">
        Seus dados são usados apenas para acessar sua conta e organizar seu
        perfil.
      </p>
    </div>
  );
}

function submitLabel(mode: AuthFormMode): string {
  switch (mode) {
    case 'sign-up':
      return 'Criar conta';
    case 'sign-in':
      return 'Entrar';
    case 'recovery':
      return 'Enviar instruções';
    case 'resend-confirmation':
      return 'Reenviar confirmação';
    case 'reset':
      return 'Salvar nova senha';
  }
}
