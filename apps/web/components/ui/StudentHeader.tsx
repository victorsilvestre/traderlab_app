import { homeClass } from './homeStyles';
import Link from 'next/link';
import { AccountMenu } from './AccountMenu';
import { HomeSearch } from './HomeSearch';
import { NotificationMenu } from './NotificationMenu';
import type { NotificationListDto } from '@traderlab/contracts';
import type { UserProfileDetailsDto } from '@traderlab/contracts';
import { getCurrentAccessToken } from '../../lib/authentication/getCurrentAccessToken';
import { getNotifications } from '../../lib/notifications/notificationApi';

export async function StudentHeader({
  name,
  avatarUrl,
  role,
  homeHref,
  notificationInbox,
}: {
  name: string;
  avatarUrl?: string | null;
  role?: UserProfileDetailsDto['role'];
  homeHref?: string;
  notificationInbox?: NotificationListDto | null;
}) {
  let inbox = notificationInbox;
  if (inbox === undefined) {
    try {
      const accessToken = await getCurrentAccessToken();
      inbox = accessToken
        ? await getNotifications(accessToken, { limit: 5, timeoutMs: 1800 })
        : null;
    } catch {
      inbox = null;
    }
  }

  return (
    <header className={homeClass('student-header')}>
      <Link
        className={homeClass('brand-mark')}
        href={homeHref ?? '/home'}
        aria-label="TraderLab, início"
      >
        <span className={homeClass('brand-symbol')} aria-hidden="true">
          T
        </span>
        <span>TraderLab</span>
      </Link>
      <div className={homeClass('student-header-actions')}>
        <HomeSearch />
        <NotificationMenu
          inbox={inbox ?? { items: [], unreadCount: 0, nextOffset: null }}
          unavailable={inbox === null}
        />
        <AccountMenu
          name={name}
          avatarUrl={avatarUrl}
          roleLabel={
            role
              ? {
                  student: 'Aluno',
                  mentor: 'Mentor',
                  administrator: 'Administrador',
                }[role]
              : 'Aluno'
          }
        />
      </div>
    </header>
  );
}
