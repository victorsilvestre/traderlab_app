export type NotificationListFilter = 'all' | 'unread';

export type NotificationRecord = {
  id: number;
  title: string;
  description: string;
  linkUrl: string | null;
  audience: 'GENERAL' | 'COURSE';
  courseId: number | null;
  courseTitle: string | null;
  sentAt: Date;
  readAt: Date | null;
};

export interface NotificationRepository {
  listForUser(input: {
    userId: string;
    filter: NotificationListFilter;
    offset: number;
    limit: number;
  }): Promise<NotificationRecord[]>;
  countUnread(userId: string): Promise<number>;
  updateReadState(input: {
    userId: string;
    notificationId: number;
    isRead: boolean;
  }): Promise<boolean>;
  markAllAsRead(userId: string): Promise<number>;
}
