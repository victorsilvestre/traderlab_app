import type { NotificationListDto } from '@traderlab/contracts';
import type {
  NotificationListFilter,
  NotificationRepository,
} from '../domain/Notification.js';

const maximumPageSize = 50;

export class NotificationService {
  constructor(private readonly repository: NotificationRepository) {}

  async listForUser(input: {
    userId: string;
    filter: NotificationListFilter;
    offset: number;
    limit: number;
  }): Promise<NotificationListDto> {
    const offset = Math.max(0, Math.floor(input.offset));
    const limit = Math.min(
      maximumPageSize,
      Math.max(1, Math.floor(input.limit)),
    );
    const [pageRecords, unreadCount] = await Promise.all([
      this.repository.listForUser({ ...input, offset, limit: limit + 1 }),
      this.repository.countUnread(input.userId),
    ]);
    const hasMore = pageRecords.length > limit;
    const records = pageRecords.slice(0, limit);
    const items = records.map((record) => ({
      id: record.id,
      title: record.title,
      description: record.description,
      linkUrl: record.linkUrl,
      audience: record.audience.toLowerCase() as 'general' | 'course',
      courseId: record.courseId,
      courseTitle: record.courseTitle,
      sentAt: record.sentAt.toISOString(),
      readAt: record.readAt?.toISOString() ?? null,
    }));

    return {
      items,
      unreadCount,
      nextOffset: hasMore ? offset + records.length : null,
    };
  }

  updateReadState(input: {
    userId: string;
    notificationId: number;
    isRead: boolean;
  }) {
    return this.repository.updateReadState(input);
  }

  markAllAsRead(userId: string) {
    return this.repository.markAllAsRead(userId);
  }
}
