import type { UserProfileDetailsDto, UserRole } from '@traderlab/contracts';

export type EditableUserProfile = {
  id: string;
  name: string;
  phone: string;
  avatarPath: string | null;
  role: UserRole;
};

export interface UserProfileRepository {
  findById(id: string): Promise<EditableUserProfile | null>;
  update(
    id: string,
    update: { name?: string; phone?: string; avatarPath?: string | null },
  ): Promise<EditableUserProfile>;
}

export interface ProfileAvatarStorage {
  createUpload(path: string): Promise<{ token: string }>;
  createReadUrl(path: string): Promise<string>;
  exists(path: string): Promise<boolean>;
}

export type UserProfileView = UserProfileDetailsDto;
