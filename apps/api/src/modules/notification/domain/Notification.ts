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

export type ManagedNotificationAudience = 'GENERAL' | 'COURSE';

export type ManagedNotificationRecord = {
  id: number;
  title: string;
  description: string;
  linkUrl: string | null;
  audience: ManagedNotificationAudience;
  courseId: number | null;
  courseTitle: string | null;
  sentAt: Date;
  recipientCount: number;
};

export type ManagedNotificationRecipientRecord = {
  name: string;
  userId: string;
  email: string | null;
  sentAt: Date;
};

export type ManagedNotificationInput = {
  title: string;
  description: string;
  linkUrl: string | null;
  audience: ManagedNotificationAudience;
  courseId: number | null;
  createdById: string;
  recipients: Array<{ userId: string; email: string | null }>;
};

export type NotificationIdentityRecord = {
  id: string;
  email: string | null;
};

export interface NotificationIdentityDirectory {
  listAll(): Promise<NotificationIdentityRecord[]>;
}

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
  listForAdmin(input: { offset: number; limit: number }): Promise<{
    items: ManagedNotificationRecord[];
    totalItems: number;
  }>;
  findForAdmin(notificationId: number): Promise<ManagedNotificationRecord | null>;
  listRecipients(input: {
    notificationId: number;
    offset: number;
    limit: number;
  }): Promise<ManagedNotificationRecipientRecord[]>;
  listRecipientCandidateIds(input: {
    audience: ManagedNotificationAudience;
    courseId: number | null;
  }): Promise<string[]>;
  listCourses(): Promise<Array<{ id: number; title: string }>>;
  createPublished(input: ManagedNotificationInput): Promise<{
    id: number;
    sentAt: Date;
    recipientCount: number;
  }>;
}
