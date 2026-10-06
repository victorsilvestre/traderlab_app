'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { MessageDto } from '../../lib/api';
import { apiRequest } from '../../lib/api';
import { completeSignIn } from '../../lib/authentication/completeSignIn';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';

export type AuthFormMode =
  | 'sign-up'
  | 'sign-in'
  | 'recovery'
  | 'resend-confirmation'
  | 'reset';

const labels: Record<
  Exclude<AuthFormMode, 'reset'>,
  { title: string; description: string }
> = {
  'sign-up': {
    title: 'Crie sua conta',
    description: 'Comece sua jornada de aprendizado no TraderLab.',
  },
  'sign-in': {
    title: 'Boas-vindas de volta',
    description: 'Entre na sua conta para continuar seus estudos.',
  },
  recovery: {
    title: 'Esqueceu sua senha?',
    description: 'Informe seu e-mail e enviaremos as instruções para recuperar o acesso.',
  },
  'resend-confirmation': {
    title: 'Confirme seu e-mail',
    description: 'Informe seu e-mail para receber um novo link de confirmação.',
  },
};

export function AuthForm({
  mode,
  returnTo = '/',
  notice = '',
}: {
  mode: AuthFormMode;
  returnTo?: string;
  notice?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        await completeSignIn({ email, password }, router, returnTo);
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
  const hasSocialOption = mode === 'sign-in' || mode === 'sign-up';
  const hasPassword = mode === 'sign-in' || mode === 'sign-up' || isReset;

  return (
    <div className="auth-form-wrap">
      <p className="eyebrow">Sua área de aprendizagem</p>
      <h1>{copy.title}</h1>
      <p className="form-intro">{copy.description}</p>
      {notice && <p className="form-message form-message-error" role="alert">{notice}</p>}

      {hasSocialOption && (
        <div className="social-options">
          <button className="social-button" type="button" disabled>
            Entrar com Google <span className="coming-soon">Em breve</span>
          </button>
          <div className="auth-divider" aria-hidden="true"><span>ou</span></div>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === 'sign-up' && (
          <>
            <label htmlFor="name">Nome completo</label>
            <input id="name" name="name" type="text" autoComplete="name" maxLength={120} required />
          </>
        )}

        {(mode === 'sign-up' || mode === 'sign-in' || mode === 'recovery' || mode === 'resend-confirmation') && (
          <>
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required />
          </>
        )}

        {mode === 'sign-up' && (
          <>
            <label htmlFor="phone">Telefone</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={30} required />
          </>
        )}

        {hasPassword && (
          <>
            <div className="label-row">
              <label htmlFor="password">{isReset ? 'Nova senha' : 'Senha'}</label>
              {mode === 'sign-in' && <Link href="/password-recovery">Esqueceu a senha?</Link>}
            </div>
            <div className="password-input-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                minLength={6}
                maxLength={128}
                required
              />
              <button
                className="password-visibility"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {mode === 'sign-up' && <p className="field-hint">Use pelo menos 6 caracteres.</p>}
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

        {error && <p className="form-message form-message-error" role="alert">{error}</p>}
        {message && <p className="form-message form-message-success" role="status">{message}</p>}

        <button className="primary-button" type="submit" disabled={busy}>
          {busy ? 'Aguarde…' : submitLabel(mode)}
        </button>
      </form>

      <nav className="auth-links" aria-label="Outras opções de acesso">
        {mode === 'sign-in' && <p>Não possui conta? <Link href="/sign-up">Cadastre-se.</Link></p>}
        {mode === 'sign-up' && <p>Possui conta? <Link href="/sign-in">Faça login.</Link></p>}
        {(mode === 'recovery' || mode === 'resend-confirmation' || isReset) && <p>Possui conta? <Link href="/sign-in">Faça login.</Link></p>}
      </nav>

      {mode === 'sign-in' && (
        <p className="legal-note">
          Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade do TraderLab.
        </p>
      )}
    </div>
  );
}

function submitLabel(mode: AuthFormMode): string {
  switch (mode) {
    case 'sign-up': return 'Criar conta';
    case 'sign-in': return 'Entrar';
    case 'recovery': return 'Enviar instruções';
    case 'resend-confirmation': return 'Reenviar confirmação';
    case 'reset': return 'Salvar nova senha';
  }
}
