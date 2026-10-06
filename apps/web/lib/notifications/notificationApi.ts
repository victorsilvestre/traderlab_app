import 'server-only';
import type { ApiErrorDto, NotificationListDto } from '@traderlab/contracts';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
  timeoutMs = 4000,
) {
  if (!apiUrl) throw new Error('A API do TraderLab não está configurada.');
  const response = await fetch(`${apiUrl.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${accessToken}`,
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...init?.headers,
    },
    cache: 'no-store',
    signal: init?.signal ?? AbortSignal.timeout(timeoutMs),
  });
  const body = (await response.json().catch(() => ({}))) as T | ApiErrorDto;
  if (!response.ok) {
    const error = new Error(
      body && typeof body === 'object' && 'message' in body
        ? body.message
        : 'Não foi possível carregar as notificações.',
    );
    Object.assign(error, { statusCode: response.status });
    throw error;
  }
  return body as T;
}

export function getNotifications(
  accessToken: string,
  options: {
    filter?: 'all' | 'unread';
    offset?: number;
    limit?: number;
    timeoutMs?: number;
  } = {},
) {
  const query = new URLSearchParams();
  if (options.filter) query.set('filter', options.filter);
  if (options.offset !== undefined) query.set('offset', String(options.offset));
  if (options.limit !== undefined) query.set('limit', String(options.limit));
  const suffix = query.size ? `?${query.toString()}` : '';
  return request<NotificationListDto>(
    `/notifications${suffix}`,
    accessToken,
    undefined,
    options.timeoutMs,
  );
}

export function updateNotificationReadState(
  accessToken: string,
  notificationId: number,
  isRead: boolean,
) {
  return request<{ updated: true }>(
    `/notifications/${encodeURIComponent(notificationId)}/read-state`,
    accessToken,
    { method: 'PATCH', body: JSON.stringify({ isRead }) },
  );
}

export function markAllNotificationsAsRead(accessToken: string) {
  return request<{ updatedCount: number }>(
    '/notifications/read-all',
    accessToken,
    { method: 'POST' },
  );
}
