import { UserRole } from '../../../generated/prisma/client.js';
import { prisma } from '../../../database/prisma.js';
import type {
  AdminUserDetailsRecord,
  AdminUserListRecord,
  EditableUserProfile,
  UserProfileRepository,
} from '../domain/UserProfile.js';

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

  async listAdminUsers(input: { query: string; offset: number; limit: number }) {
    const query = input.query.trim();
    const where = query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query, mode: 'insensitive' as const } },
            { phone: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const [profiles, totalItems] = await Promise.all([
      prisma.userProfile.findMany({
        where,
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        skip: input.offset,
        take: input.limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      prisma.userProfile.count({ where }),
    ]);
    return {
      items: profiles.map((profile) => ({
        ...profile,
        role: profile.role.toLowerCase(),
      })),
      totalItems,
    };
  }

  async findAdminUser(id: string): Promise<AdminUserDetailsRecord | null> {
    const profile = await prisma.userProfile.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarPath: true,
        createdAt: true,
        lastLoginAt: true,
        enrollments: {
          orderBy: [{ grantedAt: 'desc' }, { id: 'desc' }],
          select: {
            courseId: true,
            status: true,
            source: true,
            grantedAt: true,
            course: { select: { title: true } },
          },
        },
      },
    });
    if (!profile) return null;

    const [progress, completedContents, receivedCount, unreadCount] = await Promise.all([
      prisma.contentProgress.aggregate({
        where: { studentId: id, content: { kind: 'LESSON' } },
        _count: { _all: true },
        _max: { lastAccessedAt: true },
      }),
      prisma.contentProgress.count({
        where: {
          studentId: id,
          completedAt: { not: null },
          content: { kind: 'LESSON' },
        },
      }),
      prisma.notificationRecipient.count({ where: { userId: id } }),
      prisma.notificationRecipient.count({ where: { userId: id, readAt: null } }),
    ]);

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      role: profile.role.toLowerCase(),
      avatarPath: profile.avatarPath,
      createdAt: profile.createdAt,
      lastLoginAt: profile.lastLoginAt,
      enrollments: profile.enrollments.map((enrollment) => ({
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        status: enrollment.status,
        source: enrollment.source.toLowerCase(),
        grantedAt: enrollment.grantedAt,
      })),
      progressSummary: {
        accessedContents: progress._count._all,
        completedContents,
        lastActivityAt: progress._max.lastAccessedAt,
      },
      notificationSummary: { receivedCount, unreadCount },
    };
  }
}
