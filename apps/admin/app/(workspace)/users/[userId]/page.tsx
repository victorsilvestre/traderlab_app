import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { AdminUserDetailsDto } from '@traderlab/contracts';
import { AdminUserDetails } from '../../../../components/ui/AdminUserDetails';
import { getAdminUser } from '../../../../lib/users/adminUserApi';
import { safeAdminReturnTo } from '../../../../lib/navigation/safeAdminReturnTo';

type PageProps = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ query?: string; page?: string; returnTo?: string }>;
};

export default async function AdminUserDetailsPage({ params, searchParams }: PageProps) {
  const [{ userId }, filters] = await Promise.all([params, searchParams]);
  const response = await getAdminUser(userId);
  if (response.status === 401) redirect('/sign-in');
  if (response.status === 403 || response.status === 404) notFound();
  if (!response.ok) {
    return (
      <section role="alert">
        <p>Não foi possível carregar os dados do usuário agora.</p>
      <Link href={`/users/${encodeURIComponent(userId)}?${new URLSearchParams({ ...(filters.returnTo ? { returnTo: filters.returnTo } : {}), ...(filters.query ? { query: filters.query } : {}), ...(filters.page ? { page: filters.page } : {}) }).toString()}`}>Tentar novamente</Link>
      </section>
    );
  }
  const user = (await response.json()) as AdminUserDetailsDto;
  const query = filters.query?.trim().slice(0, 120) ?? '';
  const requestedPage = Number(filters.page ?? '1');
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;
  const backParams = new URLSearchParams();
  if (query) backParams.set('query', query);
  if (page > 1) backParams.set('page', String(page));
  const fallbackBackHref = backParams.size ? `/users?${backParams.toString()}` : '/users';
  const backHref = safeAdminReturnTo(filters.returnTo, filters.returnTo ? '/users' : fallbackBackHref);
  if (filters.returnTo) backParams.set('returnTo', safeAdminReturnTo(filters.returnTo, '/users'));
  const currentHref = `/users/${encodeURIComponent(userId)}${backParams.size ? `?${backParams.toString()}` : ''}`;

  return <AdminUserDetails user={user} backHref={backHref} enrollmentReturnTo={currentHref} />;
}
