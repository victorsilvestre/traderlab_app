import { prisma } from '../../../database/prisma.js';
import type {
  NotificationListFilter,
  NotificationRecord,
  NotificationRepository,
} from '../domain/Notification.js';

export class PrismaNotificationRepository implements NotificationRepository {
  async listForUser(input: {
    userId: string;
    filter: NotificationListFilter;
    offset: number;
    limit: number;
  }): Promise<NotificationRecord[]> {
    const records = await prisma.notification.findMany({
      where: {
        status: 'PUBLISHED',
        recipients: {
          some: {
            userId: input.userId,
            ...(input.filter === 'unread' ? { readAt: null } : {}),
          },
        },
      },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      skip: input.offset,
      take: input.limit,
      select: {
        id: true,
        title: true,
        description: true,
        linkUrl: true,
        audience: true,
        courseId: true,
        publishedAt: true,
        course: { select: { title: true } },
        recipients: {
          where: { userId: input.userId },
          select: { readAt: true },
          take: 1,
        },
      },
    });

    return records.map((record) => ({
      id: record.id,
      title: record.title,
      description: record.description,
      linkUrl: record.linkUrl,
      audience: record.audience,
      courseId: record.courseId,
      courseTitle: record.course?.title ?? null,
      sentAt: record.publishedAt ?? new Date(),
      readAt: record.recipients[0]?.readAt ?? null,
    }));
  }

  countUnread(userId: string): Promise<number> {
    return prisma.notificationRecipient.count({
      where: {
        userId,
        readAt: null,
        notification: { status: 'PUBLISHED' },
      },
    });
  }

  async updateReadState(input: {
    userId: string;
    notificationId: number;
    isRead: boolean;
  }): Promise<boolean> {
    const result = await prisma.notificationRecipient.updateMany({
      where: {
        userId: input.userId,
        notificationId: input.notificationId,
        notification: { status: 'PUBLISHED' },
      },
      data: { readAt: input.isRead ? new Date() : null },
    });
    return result.count > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notificationRecipient.updateMany({
      where: {
        userId,
        readAt: null,
        notification: { status: 'PUBLISHED' },
      },
      data: { readAt: new Date() },
    });
    return result.count;
  }
}
