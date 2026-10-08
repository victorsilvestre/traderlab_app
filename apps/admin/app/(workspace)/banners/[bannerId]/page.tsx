import { notFound, redirect } from 'next/navigation';
import type { ManagedHomeBannerDto } from '@traderlab/contracts';
import { AdminBannerForm } from '../../../../components/forms/AdminBannerForm';
import { safeAdminReturnTo } from '../../../../lib/navigation/safeAdminReturnTo';
import { getAdminBanners } from '../../../../lib/banners/adminBannerApi';
import { requestAdminApi } from '../../../../lib/courses/adminCourseApi';

type PageProps = { params: Promise<{ bannerId: string }>; searchParams: Promise<{ returnTo?: string }> };

export default async function EditAdminBannerPage({ params, searchParams }: PageProps) {
  const [{ bannerId }, query] = await Promise.all([params, searchParams]);
  const returnTo = safeAdminReturnTo(query.returnTo, '/banners');
  const [bannerResponse, listResponse] = await Promise.all([
    requestAdminApi(`/admin/banners/${encodeURIComponent(bannerId)}`), getAdminBanners(),
  ]);
  if (bannerResponse.status === 401 || listResponse.status === 401) redirect('/sign-in');
  if (bannerResponse.status === 403 || listResponse.status === 403) notFound();
  if (!bannerResponse.ok) notFound();
  const banner = await bannerResponse.json().catch(() => null) as ManagedHomeBannerDto | null;
  const list = listResponse.ok ? await listResponse.json().catch(() => null) as { activeCount?: number } | null : null;
  if (!banner) notFound();
  return <AdminBannerForm returnTo={returnTo} activeCount={list?.activeCount ?? 0} banner={banner} />;
}
