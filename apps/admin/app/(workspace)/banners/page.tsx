import { notFound, redirect } from 'next/navigation';
import type { ManagedHomeBannersDto } from '@traderlab/contracts';
import { AdminBannerCatalog } from '../../../components/ui/AdminBannerCatalog';
import { safeAdminReturnTo } from '../../../lib/navigation/safeAdminReturnTo';
import { getAdminBanners } from '../../../lib/banners/adminBannerApi';

type PageProps = { searchParams: Promise<{ returnTo?: string }> };

export default async function AdminBannersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const response = await getAdminBanners();
  if (response.status === 401) redirect('/sign-in');
  if (response.status === 403) notFound();
  const payload = await response.json().catch(() => null) as ManagedHomeBannersDto | { message?: string } | null;
  const data = response.ok && payload && 'items' in payload ? payload : undefined;
  const error = response.ok ? undefined : payload && 'message' in payload && payload.message ? payload.message : 'Não foi possível carregar os banners.';
  const returnTo = safeAdminReturnTo(params.returnTo, '/');
  return <AdminBannerCatalog data={data} errorMessage={error} returnTo={returnTo} />;
}
