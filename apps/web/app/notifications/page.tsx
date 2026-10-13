import { redirect } from 'next/navigation';
import { NotificationCenter } from '../../components/ui/NotificationCenter';
import { getCurrentUserProfile } from '../../lib/authentication/getCurrentUserProfile';
import { getSignInPath } from '../../lib/authentication/returnPath';
import { getNotifications } from '../../lib/notifications/notificationApi';
import { StudentWorkspaceShell } from '../../components/ui/StudentWorkspaceShell';

type NotificationsPageProps = {
  searchParams: Promise<{ filter?: string; offset?: string }>;
};

function isUnauthorized(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    error.statusCode === 401
  );
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const query = await searchParams;
  const filter = query.filter === 'unread' ? 'unread' : 'all';
  const parsedOffset = Number(query.offset ?? '0');
  const offset =
    Number.isSafeInteger(parsedOffset) && parsedOffset >= 0
      ? Math.min(parsedOffset, 10000)
      : 0;
  const returnTo = `/notifications${filter === 'unread' ? '?filter=unread' : ''}`;
  const signInPath = getSignInPath(returnTo);
  const { authenticated, accessToken, profile } = await getCurrentUserProfile();

  if (!authenticated || !accessToken) redirect(signInPath);
  if (profile && !profile.phone.trim()) redirect('/profile?complete=1');

  try {
    const inbox = await getNotifications(accessToken, {
      filter,
      offset,
      limit: 20,
    });
    const center = (
      <NotificationCenter
        inbox={inbox}
        filter={filter}
        offset={offset}
        unavailable={false}
      />
    );
    return profile ? (
      <StudentWorkspaceShell profile={profile} unreadCount={inbox.unreadCount}>
        {center}
      </StudentWorkspaceShell>
    ) : center;
  } catch (error) {
    if (isUnauthorized(error)) redirect(signInPath);
    const center = (
      <NotificationCenter
        inbox={null}
        filter={filter}
        offset={offset}
        unavailable
      />
    );
    return profile ? (
      <StudentWorkspaceShell profile={profile} unreadCount={0}>
        {center}
      </StudentWorkspaceShell>
    ) : center;
  }
}
