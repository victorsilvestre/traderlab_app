import { prisma } from '../../../database/prisma.js';
import { NotificationError } from '../domain/NotificationError.js';
import type {
  ManagedNotificationInput,
  ManagedNotificationRecord,
  ManagedNotificationRecipientRecord,
  NotificationListFilter,
  NotificationRecord,
  NotificationRepository,
} from '../domain/Notification.js';

export class PrismaNotificationRepository implements NotificationRepository {
  async listForAdmin(input: { offset: number; limit: number }) {
    const [items, totalItems] = await Promise.all([
      prisma.notification.findMany({
        where: { status: 'PUBLISHED' },
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
          _count: { select: { recipients: true } },
        },
      }),
      prisma.notification.count({ where: { status: 'PUBLISHED' } }),
    ]);
    return {
      items: items.map((item) => this.toManagedRecord(item)),
      totalItems,
    };
  }

  async findForAdmin(notificationId: number): Promise<ManagedNotificationRecord | null> {
    const item = await prisma.notification.findFirst({
      where: { id: notificationId, status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        description: true,
        linkUrl: true,
        audience: true,
        courseId: true,
        publishedAt: true,
        course: { select: { title: true } },
        _count: { select: { recipients: true } },
      },
    });
    return item ? this.toManagedRecord(item) : null;
  }

  async listRecipients(input: {
    notificationId: number;
    offset: number;
    limit: number;
  }): Promise<ManagedNotificationRecipientRecord[]> {
    const recipients = await prisma.notificationRecipient.findMany({
      where: { notificationId: input.notificationId },
      orderBy: [{ deliveredAt: 'asc' }, { userId: 'asc' }],
      skip: input.offset,
      take: input.limit,
      select: {
        userId: true,
        recipientEmail: true,
        deliveredAt: true,
        user: { select: { name: true } },
      },
    });
    return recipients.map((recipient) => ({
      userId: recipient.userId,
      name: recipient.user.name,
      email: recipient.recipientEmail,
      sentAt: recipient.deliveredAt,
    }));
  }

  async listRecipientCandidateIds(input: {
    audience: 'GENERAL' | 'COURSE';
    courseId: number | null;
  }): Promise<string[]> {
    if (input.audience === 'GENERAL') {
      const profiles = await prisma.userProfile.findMany({
        select: { id: true },
      });
      return profiles.map(({ id }) => id);
    }
    const enrollments = await prisma.enrollment.findMany({
      where: {
        status: 'ACTIVE',
        courseId: input.courseId ?? -1,
      },
      distinct: ['studentId'],
      select: { studentId: true },
    });
    return enrollments.map(({ studentId }) => studentId);
  }

  listCourses() {
    return prisma.course.findMany({
      orderBy: [{ title: 'asc' }, { id: 'asc' }],
      select: { id: true, title: true },
    });
  }

  async createPublished(input: ManagedNotificationInput) {
    const sentAt = new Date();
    return prisma.$transaction(async (transaction) => {
      const recipientIds = input.recipients.map(({ userId }) => userId);
      const eligibleIds =
        input.audience === 'GENERAL'
          ? await transaction.userProfile.findMany({
              where: { id: { in: recipientIds } },
              select: { id: true },
            }).then((profiles) => new Set(profiles.map(({ id }) => id)))
          : await transaction.enrollment.findMany({
              where: {
                studentId: { in: recipientIds },
                courseId: input.courseId ?? -1,
                status: 'ACTIVE',
              },
              distinct: ['studentId'],
              select: { studentId: true },
            }).then((enrollments) => new Set(enrollments.map(({ studentId }) => studentId)));
      const recipients = input.recipients.filter(({ userId }) => eligibleIds.has(userId));
      if (recipients.length === 0) {
        throw new NotificationError(
          'Não há usuários elegíveis para o público selecionado.',
          422,
        );
      }
      const notification = await transaction.notification.create({
        data: {
          title: input.title,
          description: input.description,
          linkUrl: input.linkUrl,
          audience: input.audience,
          courseId: input.courseId,
          status: 'PUBLISHED',
          createdById: input.createdById,
          publishedAt: sentAt,
          recipients: {
            createMany: {
              data: recipients.map(({ userId, email }) => ({
                userId,
                recipientEmail: email,
                deliveredAt: sentAt,
              })),
            },
          },
        },
        select: { id: true },
      });
      return {
        id: notification.id,
        sentAt,
        recipientCount: recipients.length,
      };
    });
  }

  private toManagedRecord(item: {
    id: number;
    title: string;
    description: string;
    linkUrl: string | null;
    audience: 'GENERAL' | 'COURSE';
    courseId: number | null;
    publishedAt: Date | null;
    course: { title: string } | null;
    _count: { recipients: number };
  }): ManagedNotificationRecord {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      linkUrl: item.linkUrl,
      audience: item.audience,
      courseId: item.courseId,
      courseTitle: item.course?.title ?? null,
      sentAt: item.publishedAt ?? new Date(0),
      recipientCount: item._count.recipients,
    };
  }

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
