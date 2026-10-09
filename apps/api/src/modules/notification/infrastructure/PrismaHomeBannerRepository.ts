import { prisma } from '../../../database/prisma.js';

export class PrismaHomeBannerRepository {
  listPublished(limit: number) {
    return prisma.homeBanner.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
      take: limit,
      select: {
        id: true,
        internalName: true,
        description: true,
        eyebrowText: true,
        overlayText: true,
        imagePath: true,
        destinationUrl: true,
        altText: true,
        displayOrder: true,
      },
    });
  }

  listForAdmin() {
    return prisma.homeBanner.findMany({
      orderBy: [{ status: 'asc' }, { displayOrder: 'asc' }, { id: 'asc' }],
    });
  }

  findForAdmin(id: number) {
    return prisma.homeBanner.findUnique({ where: { id } });
  }

  update(id: number, input: {
    internalName: string; description: string; eyebrowText: string | null;
    overlayText: string | null; imagePath: string; destinationUrl: string | null; altText: string; administratorId: string;
  }) {
    return prisma.homeBanner.update({
      where: { id },
      data: {
        internalName: input.internalName, description: input.description,
        eyebrowText: input.eyebrowText, overlayText: input.overlayText, imagePath: input.imagePath,
        destinationUrl: input.destinationUrl, altText: input.altText, updatedById: input.administratorId,
      },
    }).catch((error: unknown) => {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') return null;
      throw error;
    });
  }

  async create(input: {
    internalName: string;
    description: string;
    eyebrowText: string | null;
    overlayText: string | null;
    imagePath: string;
    destinationUrl: string | null;
    altText: string;
    administratorId: string;
  }) {
    return prisma.$transaction(async (transaction) => {
      const active = await transaction.homeBanner.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
        select: { id: true, displayOrder: true },
      });
      if (active.length >= 5) return { limitReached: true as const };
      for (const [index, banner] of active.entries()) {
        await transaction.homeBanner.update({
          where: { id: banner.id },
          data: { displayOrder: index + 2, updatedById: input.administratorId },
        });
      }
      const banner = await transaction.homeBanner.create({
        data: {
          internalName: input.internalName,
          description: input.description,
          eyebrowText: input.eyebrowText,
          overlayText: input.overlayText,
          imagePath: input.imagePath,
          destinationUrl: input.destinationUrl,
          altText: input.altText,
          status: 'PUBLISHED',
          displayOrder: 1,
          createdById: input.administratorId,
          updatedById: input.administratorId,
        },
      });
      return { banner, limitReached: false as const };
    }, { isolationLevel: 'Serializable' });
  }

  async updateStatus(id: number, status: 'PUBLISHED' | 'DRAFT', administratorId: string) {
    return prisma.$transaction(async (transaction) => {
      const existing = await transaction.homeBanner.findUnique({ where: { id } });
      if (!existing) return { missing: true as const };
      if (existing.status === status) return { banner: existing, missing: false as const };

      const active = await transaction.homeBanner.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
        select: { id: true },
      });
      if (status === 'PUBLISHED' && active.length >= 5) return { limitReached: true as const };

      if (status === 'DRAFT') {
        await transaction.homeBanner.update({
          where: { id },
          data: { status, displayOrder: 0, updatedById: administratorId },
        });
        const remaining = active.filter((item) => item.id !== id);
        for (const [index, item] of remaining.entries()) {
          await transaction.homeBanner.update({ where: { id: item.id }, data: { displayOrder: index + 1 } });
        }
        return { banner: await transaction.homeBanner.findUniqueOrThrow({ where: { id } }), missing: false as const };
      }

      const maxOrder = active.length ? active[active.length - 1] : undefined;
      const last = maxOrder
        ? await transaction.homeBanner.findUniqueOrThrow({ where: { id: maxOrder.id }, select: { displayOrder: true } })
        : null;
      const banner = await transaction.homeBanner.update({
        where: { id },
        data: { status, displayOrder: (last?.displayOrder ?? 0) + 1, updatedById: administratorId },
      });
      return { banner, missing: false as const };
    }, { isolationLevel: 'Serializable' });
  }

  async reorder(ids: number[], administratorId: string) {
    return prisma.$transaction(async (transaction) => {
      const active = await transaction.homeBanner.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
        select: { id: true },
      });
      if (active.length !== ids.length || new Set(ids).size !== ids.length || ids.some((id) => !active.some((item) => item.id === id))) {
        return false;
      }
      for (const [index, id] of ids.entries()) {
        await transaction.homeBanner.update({ where: { id }, data: { displayOrder: index + 1, updatedById: administratorId } });
      }
      return true;
    }, { isolationLevel: 'Serializable' });
  }
}
