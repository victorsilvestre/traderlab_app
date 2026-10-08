import { redirect, notFound } from 'next/navigation';
import type { ManagedNotificationPageDto } from '@traderlab/contracts';
import { AdminNotificationCatalog } from '../../../components/ui/AdminNotificationCatalog';
import { getAdminNotifications } from '../../../lib/notifications/adminNotificationApi';
import { safeAdminReturnTo } from '../../../lib/navigation/safeAdminReturnTo';

type PageProps = { searchParams: Promise<{ page?: string; returnTo?: string }> };

export default async function AdminNotificationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestedPage = Number(params.page ?? '1');
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;
  const response = await getAdminNotifications(page);
  if (response.status === 401) redirect('/sign-in');
  if (response.status === 403) notFound();
  const payload = (await response.json().catch(() => null)) as
    | ManagedNotificationPageDto
    | { message?: string }
    | null;
  const pageData = response.ok && payload && 'items' in payload ? payload : undefined;
  const errorMessage = response.ok
    ? undefined
    : payload && 'message' in payload && payload.message
      ? payload.message
      : 'Não foi possível carregar as notificações agora.';
  const returnTo = safeAdminReturnTo(params.returnTo, params.returnTo ? '/notifications' : '/');
  return (
    <AdminNotificationCatalog
      pageData={pageData}
      returnTo={returnTo}
      errorMessage={errorMessage}
    />
  );
}
