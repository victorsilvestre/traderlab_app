import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AccessDenied } from '../../components/authentication/AccessDenied';
import { SessionUnavailable } from '../../components/authentication/SessionUnavailable';
import { WorkspaceShell } from '../../components/ui/WorkspaceShell';
import { getWorkspaceSession } from '../../lib/authentication/getWorkspaceSession';

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getWorkspaceSession();
  if (session.status === 'anonymous') redirect('/sign-in');
  if (session.status === 'forbidden') return <AccessDenied />;
  if (session.status === 'unavailable') return <SessionUnavailable />;
  return <WorkspaceShell profile={session.profile}>{children}</WorkspaceShell>;
}
