import { UserRole } from '../../../generated/prisma/client.js';
import { prisma } from '../../../database/prisma.js';
import type { EditableUserProfile, UserProfileRepository } from '../domain/UserProfile.js';

function mapRole(role: UserRole): EditableUserProfile['role'] {
  return role.toLowerCase() as EditableUserProfile['role'];
}

function mapProfile(profile: {
  id: string;
  name: string;
  phone: string;
  avatarPath: string | null;
  role: UserRole;
}): EditableUserProfile {
  return {
    id: profile.id,
    name: profile.name,
    phone: profile.phone,
    avatarPath: profile.avatarPath,
    role: mapRole(profile.role),
  };
}

export class PrismaUserProfileRepository implements UserProfileRepository {
  async findById(id: string): Promise<EditableUserProfile | null> {
    const profile = await prisma.userProfile.findUnique({ where: { id } });
    return profile ? mapProfile(profile) : null;
  }

  async update(
    id: string,
    update: { name?: string; phone?: string; avatarPath?: string | null },
  ): Promise<EditableUserProfile> {
    return mapProfile(await prisma.userProfile.update({ where: { id }, data: update }));
  }
}
