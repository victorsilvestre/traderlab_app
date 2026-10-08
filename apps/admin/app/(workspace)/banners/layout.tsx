import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { getWorkspaceSession } from '../../../lib/authentication/getWorkspaceSession';

export default async function AdminBannersLayout({ children }: { children: ReactNode }) {
  const session = await getWorkspaceSession();
  if (session.status === 'authorized' && session.profile.role !== 'administrator') notFound();
  return children;
}
