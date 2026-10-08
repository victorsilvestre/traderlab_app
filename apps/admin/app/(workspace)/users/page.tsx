import { redirect, notFound } from 'next/navigation';
import type { AdminUserPageDto } from '@traderlab/contracts';
import { AdminUserCatalog } from '../../../components/ui/AdminUserCatalog';
import { getAdminUsers } from '../../../lib/users/adminUserApi';
import { safeAdminReturnTo } from '../../../lib/navigation/safeAdminReturnTo';

type PageProps = { searchParams: Promise<{ query?: string; page?: string; returnTo?: string }> };

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.query?.trim().slice(0, 120) ?? '';
  const requestedPage = Number(params.page ?? '1');
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;
  const response = await getAdminUsers({ query, page });
  if (response.status === 401) redirect('/sign-in');
  if (response.status === 403) notFound();
  const payload = (await response.json().catch(() => null)) as
    | AdminUserPageDto
    | { message?: string }
    | null;
  const pageData = response.ok && payload && 'items' in payload ? payload : undefined;
  const errorMessage = response.ok
    ? undefined
    : payload && 'message' in payload && payload.message
      ? payload.message
      : 'Não foi possível carregar os usuários agora.';
  const backFallback = params.returnTo ? '/users' : '/';
  const returnTo = safeAdminReturnTo(params.returnTo, backFallback);

  return <AdminUserCatalog pageData={pageData} query={query} returnTo={returnTo} errorMessage={errorMessage} />;
}
