import 'server-only';

import type { ReactNode } from 'react';
import type { UserProfileDetailsDto } from '@traderlab/contracts';
import { getCurrentAccessToken } from '../../lib/authentication/getCurrentAccessToken';
import { getNotifications } from '../../lib/notifications/notificationApi';
import { StudentDock } from './StudentDock';

export async function StudentWorkspaceShell({
  profile,
  unreadCount,
  children,
}: {
  profile: UserProfileDetailsDto;
  unreadCount?: number | null;
  children: ReactNode;
}) {
  let unread = unreadCount ?? 0;

  if (unreadCount === undefined) {
    try {
      const token = await getCurrentAccessToken();
      if (token) {
        const inbox = await getNotifications(token, {
          filter: 'unread',
          limit: 1,
          timeoutMs: 1800,
        });
        unread = inbox.unreadCount;
      }
    } catch {
      unread = 0;
    }
  }

  return (
    <>
      <StudentDock
        name={profile.name}
        avatarUrl={profile.avatarUrl}
        role={profile.role}
        unreadCount={unread}
      />
      {children}
    </>
  );
}
