import type { UserProfileDto } from '@traderlab/contracts';

export type NewUserProfile = {
  id: string;
  name: string;
  phone: string;
};

export interface UserProfileRepository {
  createForStudent(profile: NewUserProfile): Promise<UserProfileDto>;
  findById(id: string): Promise<UserProfileDto | null>;
}
