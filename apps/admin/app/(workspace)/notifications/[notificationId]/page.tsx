import { notFound, redirect } from 'next/navigation';
import type { ManagedNotificationDetailsDto } from '@traderlab/contracts';
import { AdminNotificationDetails } from '../../../../components/ui/AdminNotificationDetails';
import { getAdminNotification } from '../../../../lib/notifications/adminNotificationApi';
import { safeAdminReturnTo } from '../../../../lib/navigation/safeAdminReturnTo';

type PageProps = {
  params: Promise<{ notificationId: string }>;
  searchParams: Promise<{ page?: string; returnTo?: string }>;
};

export default async function AdminNotificationDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const [{ notificationId }, query] = await Promise.all([params, searchParams]);
  const id = Number(notificationId);
  if (!Number.isSafeInteger(id) || id < 1) notFound();
  const requestedPage = Number(query.page ?? '1');
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;
  const response = await getAdminNotification(id, page);
  if (response.status === 401) redirect('/sign-in');
  if (response.status === 404 || response.status === 403) notFound();
  const payload = (await response.json().catch(() => null)) as
    | ManagedNotificationDetailsDto
    | { message?: string }
    | null;
  const details = response.ok && payload && 'recipients' in payload
    ? payload
    : undefined;
  const errorMessage = response.ok
    ? undefined
    : payload && 'message' in payload && payload.message
      ? payload.message
      : 'Não foi possível carregar os detalhes da notificação.';
  const returnTo = safeAdminReturnTo(query.returnTo, '/notifications');
  return <AdminNotificationDetails details={details} returnTo={returnTo} errorMessage={errorMessage} />;
}
