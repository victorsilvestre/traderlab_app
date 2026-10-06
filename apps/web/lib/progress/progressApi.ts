import 'server-only';
import type { ApiErrorDto, RecentContentDto } from '@traderlab/contracts';

export async function getStudentRecentContents(accessToken: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('A API do TraderLab não está configurada.');

  const response = await fetch(
    `${apiUrl.replace(/\/$/, '')}/progress/recent-contents`,
    {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    },
  );
  const body = (await response.json().catch(() => [])) as
    | RecentContentDto[]
    | ApiErrorDto;

  if (!response.ok) {
    const error = new Error(
      body && typeof body === 'object' && 'message' in body
        ? body.message
        : 'Não foi possível carregar seus conteúdos recentes.',
    );
    Object.assign(error, { statusCode: response.status });
    throw error;
  }
  return body as RecentContentDto[];
}
