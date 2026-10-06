'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAccessToken } from '../authentication/getCurrentAccessToken';
import {
  markAllNotificationsAsRead,
  updateNotificationReadState,
} from './notificationApi';

export async function updateNotificationReadAction(formData: FormData) {
  const accessToken = await getCurrentAccessToken();
  const notificationId = Number(formData.get('notificationId'));
  const isRead = formData.get('isRead') === 'true';
  if (
    !accessToken ||
    !Number.isSafeInteger(notificationId) ||
    notificationId < 1
  ) {
    return;
  }
  await updateNotificationReadState(accessToken, notificationId, isRead);
  revalidatePath('/notifications');
  revalidatePath('/home');
}

export async function markAllNotificationsReadAction() {
  const accessToken = await getCurrentAccessToken();
  if (!accessToken) return;
  await markAllNotificationsAsRead(accessToken);
  revalidatePath('/notifications');
  revalidatePath('/home');
}
