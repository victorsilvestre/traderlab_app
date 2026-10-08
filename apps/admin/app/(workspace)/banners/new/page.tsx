import { notFound, redirect } from 'next/navigation';
import { AdminBannerForm } from '../../../../components/forms/AdminBannerForm';
import { safeAdminReturnTo } from '../../../../lib/navigation/safeAdminReturnTo';
import { getAdminBanners } from '../../../../lib/banners/adminBannerApi';

type PageProps = { searchParams: Promise<{ returnTo?: string }> };

export default async function NewAdminBannerPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const returnTo = safeAdminReturnTo(params.returnTo, '/banners');
  const response = await getAdminBanners();
  if (response.status === 401) redirect('/sign-in');
  if (response.status === 403) notFound();
  const result = response.ok ? await response.json().catch(() => null) as { activeCount?: number } | null : null;
  return <AdminBannerForm returnTo={returnTo} activeCount={result?.activeCount ?? 0} />;
}
