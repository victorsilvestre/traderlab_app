import 'server-only';
import type { ApiErrorDto, HomeBannerDto } from '@traderlab/contracts';

export async function getHomeBanners(accessToken: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('A API do TraderLab não está configurada.');

  const response = await fetch(`${apiUrl.replace(/\/$/, '')}/home/banners`, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(6000),
  });
  const body = (await response.json().catch(() => [])) as
    | HomeBannerDto[]
    | ApiErrorDto;

  if (!response.ok) {
    const error = new Error(
      body && typeof body === 'object' && 'message' in body
        ? body.message
        : 'Não foi possível carregar os banners.',
    );
    Object.assign(error, { statusCode: response.status });
    throw error;
  }
  return body as HomeBannerDto[];
}
