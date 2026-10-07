'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';
import styles from './AdminAuthForm.module.css';

export type AuthMode = 'sign-in' | 'recovery' | 'confirmation' | 'reset';

const copy: Record<
  AuthMode,
  { title: string; description: string; button: string }
> = {
  'sign-in': {
    title: 'Entrar',
    description:
      'Use o e-mail e a senha da sua conta de mentor ou administrador.',
    button: 'Entrar no ambiente',
  },
  recovery: {
    title: 'Recuperar senha',
    description:
      'Informe seu e-mail para receber as instruções de redefinição.',
    button: 'Enviar instruções',
  },
  confirmation: {
    title: 'Solicitar outro link',
    description: 'Informe seu e-mail para receber um novo link de confirmação.',
    button: 'Solicitar link',
  },
  reset: {
    title: 'Defina uma nova senha',
    description: 'Use pelo menos seis caracteres. Depois, entre novamente.',
    button: 'Salvar nova senha',
  },
};

const endpoint: Record<AuthMode, string> = {
  'sign-in': '/api/auth/sign-in',
  recovery: '/api/auth/password-recovery',
  confirmation: '/api/auth/email-confirmation',
  reset: '/api/auth/password-reset',
};

export function AdminAuthForm({
  mode,
  notice,
}: {
  mode: AuthMode;
  notice?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    const fields = new FormData(event.currentTarget);
    const email = String(fields.get('email') ?? '').trim();
    const password = String(fields.get('password') ?? '');
    const passwordConfirmation = String(
      fields.get('passwordConfirmation') ?? '',
    );
    if (mode === 'reset' && password !== passwordConfirmation) {
      setError('As senhas informadas não coincidem.');
      setBusy(false);
      return;
    }
    try {
      const response = await fetch(endpoint[mode], {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          mode === 'reset'
            ? { password, passwordConfirmation }
            : mode === 'sign-in'
              ? { email, password }
              : { email },
        ),
      });
      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!response.ok)
        throw new Error(
          body.message ?? 'Não foi possível concluir a solicitação.',
        );
      if (mode === 'sign-in') {
        router.replace('/');
        router.refresh();
        return;
      }
      if (mode === 'reset') {
        const { error: signOutError } =
          await createSupabaseBrowserClient().auth.signOut({ scope: 'local' });
        if (signOutError)
          throw new Error(
            'Senha atualizada. Saia da sessão e entre novamente.',
          );
        router.replace('/sign-in?reset=success');
        router.refresh();
        return;
      }
      setMessage(body.message ?? 'Solicitação recebida.');
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível concluir a solicitação.',
      );
    } finally {
      setBusy(false);
    }
  }

  const content = copy[mode];
  return (
    <div className={styles.wrap}>
      <h2>{content.title}</h2>
      <p className={styles.description}>{content.description}</p>
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}
      <form onSubmit={submit}>
        {mode !== 'reset' && (
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
        {(mode === 'sign-in' || mode === 'reset') && (
          <>
            <label htmlFor="password">
              {mode === 'reset' ? 'Nova senha' : 'Senha'}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={
                mode === 'reset' ? 'new-password' : 'current-password'
              }
              minLength={6}
              maxLength={128}
              required
            />
          </>
        )}
        {mode === 'reset' && (
          <>
            <label htmlFor="passwordConfirmation">Confirmar nova senha</label>
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
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className={styles.notice} role="status">
            {message}
          </p>
        )}
        <button type="submit" disabled={busy}>
          {busy ? 'Aguarde…' : content.button}
        </button>
      </form>
      <nav className={styles.links} aria-label="Outras opções de acesso">
        {mode === 'sign-in' ? (
          <>
            <Link href="/password-recovery">Esqueceu sua senha?</Link>
            <Link href="/email-confirmation">
              Solicitar confirmação de e-mail
            </Link>
          </>
        ) : (
          <Link href="/sign-in">Voltar para entrar</Link>
        )}
      </nav>
      {mode === 'sign-in' && (
        <p className={styles.footnote}>
          Não há cadastro público no ambiente de gestão.
        </p>
      )}
    </div>
  );
}
