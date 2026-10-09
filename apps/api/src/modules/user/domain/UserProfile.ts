import type { UserProfileDetailsDto, UserRole } from '@traderlab/contracts';

export type EditableUserProfile = {
  id: string;
  name: string;
  phone: string;
  avatarPath: string | null;
  role: UserRole;
};

export type AdminUserListRecord = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: string;
  createdAt: Date;
  lastLoginAt: Date | null;
};

export type AdminUserDetailsRecord = AdminUserListRecord & {
  avatarPath: string | null;
  enrollments: Array<{
    courseId: number;
    courseTitle: string;
    status: 'ACTIVE' | 'REVOKED';
    source: string;
    grantedAt: Date;
  }>;
  progressSummary: {
    accessedContents: number;
    completedContents: number;
    lastActivityAt: Date | null;
  };
  notificationSummary: {
    receivedCount: number;
    unreadCount: number;
  };
};

export interface UserProfileRepository {
  findById(id: string): Promise<EditableUserProfile | null>;
  update(
    id: string,
    update: { name?: string; phone?: string; avatarPath?: string | null },
  ): Promise<EditableUserProfile>;
  listAdminUsers(input: { query: string; offset: number; limit: number }): Promise<{
    items: AdminUserListRecord[];
    totalItems: number;
  }>;
  findAdminUser(id: string): Promise<AdminUserDetailsRecord | null>;
}

export interface ProfileAvatarStorage {
  createUpload(path: string): Promise<{ token: string }>;
  importProviderAvatar(userId: string, url: string): Promise<string | null>;
  createReadUrl(path: string): Promise<string>;
  exists(path: string): Promise<boolean>;
}

export type UserProfileView = UserProfileDetailsDto;
