import type { UserProfileDto } from '@traderlab/contracts';

export type NewUserProfile = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

export interface UserProfileRepository {
  createForStudent(profile: NewUserProfile): Promise<UserProfileDto>;
  findById(id: string): Promise<UserProfileDto | null>;
  recordSuccessfulLogin(id: string, email: string | null, loggedInAt: Date): Promise<void>;
}
