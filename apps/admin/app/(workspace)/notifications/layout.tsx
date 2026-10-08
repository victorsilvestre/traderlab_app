import type { ReactNode } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getWorkspaceSession } from '../../../lib/authentication/getWorkspaceSession';

export default async function AdminNotificationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getWorkspaceSession();
  if (session.status === 'anonymous') redirect('/sign-in');
  if (session.status === 'authorized' && session.profile.role !== 'administrator') {
    notFound();
  }
  return children;
}
