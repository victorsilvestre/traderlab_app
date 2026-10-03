import type { UserProfileDto } from '@traderlab/contracts';
import { UserRole } from '../../../generated/prisma/client.js';
import { prisma } from '../../../database/prisma.js';
import type {
  NewUserProfile,
  UserProfileRepository,
} from '../domain/UserProfile.js';

function toDto(profile: {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
}): UserProfileDto {
  return {
    id: profile.id,
    name: profile.name,
    phone: profile.phone,
    role: profile.role.toLowerCase() as UserProfileDto['role'],
  };
}

export class PrismaUserProfileRepository implements UserProfileRepository {
  async createForStudent(profile: NewUserProfile): Promise<UserProfileDto> {
    const saved = await prisma.userProfile.upsert({
      where: { id: profile.id },
      create: {
        id: profile.id,
        name: profile.name,
        phone: profile.phone,
        role: UserRole.STUDENT,
      },
      update: {},
    });
    return toDto(saved);
  }

  async findById(id: string): Promise<UserProfileDto | null> {
    const profile = await prisma.userProfile.findUnique({ where: { id } });
    return profile ? toDto(profile) : null;
  }
}
