import type {
  ApiErrorDto,
  MessageDto,
  SignInDto,
  UserProfileDto,
} from '@traderlab/contracts';

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!configuredApiUrl) throw new Error('NEXT_PUBLIC_API_URL is required.');
const apiUrl = configuredApiUrl;

export async function apiRequest<T extends object>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${apiUrl.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init.headers,
    },
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => ({}))) as
    | T
    | ApiErrorDto;
  if (!response.ok) {
    throw new Error(
      body && typeof body === 'object' && 'message' in body
        ? body.message
        : 'Não foi possível concluir a solicitação. Tente novamente.',
    );
  }
  return body as T;
}

export type { MessageDto, SignInDto, UserProfileDto };
