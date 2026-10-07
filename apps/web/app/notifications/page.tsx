import { redirect } from 'next/navigation';
import { NotificationCenter } from '../../components/ui/NotificationCenter';
import { getCurrentUserProfile } from '../../lib/authentication/getCurrentUserProfile';
import { getSignInPath } from '../../lib/authentication/returnPath';
import { getNotifications } from '../../lib/notifications/notificationApi';

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

  try {
    const inbox = await getNotifications(accessToken, {
      filter,
      offset,
      limit: 20,
    });
    return (
      <NotificationCenter
        inbox={inbox}
        filter={filter}
        offset={offset}
        unavailable={false}
        profile={profile}
      />
    );
  } catch (error) {
    if (isUnauthorized(error)) redirect(signInPath);
    return (
      <NotificationCenter
        inbox={null}
        filter={filter}
        offset={offset}
        unavailable
        profile={profile}
      />
    );
  }
}
