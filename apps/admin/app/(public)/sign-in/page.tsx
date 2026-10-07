import { redirect } from 'next/navigation';
import { AuthShell } from '../../../components/authentication/AuthShell';
import { AdminAuthForm } from '../../../components/forms/AdminAuthForm';
import { getWorkspaceSession } from '../../../lib/authentication/getWorkspaceSession';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; confirmed?: string }>;
}) {
  const session = await getWorkspaceSession();
  if (session.status === 'authorized') redirect('/');
  const params = await searchParams;
  const notice =
    params.reset === 'success'
      ? 'Senha atualizada. Entre com a nova senha.'
      : params.confirmed === '1'
        ? 'E-mail confirmado. Entre para continuar.'
        : session.status === 'unavailable'
          ? 'Não conseguimos verificar sua sessão agora. Você pode tentar novamente.'
          : undefined;
  return (
    <AuthShell>
      <AdminAuthForm mode="sign-in" notice={notice} />
    </AuthShell>
  );
}
