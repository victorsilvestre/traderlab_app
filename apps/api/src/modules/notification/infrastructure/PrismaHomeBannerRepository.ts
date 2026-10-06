import { prisma } from '../../../database/prisma.js';

export class PrismaHomeBannerRepository {
  listPublished(limit: number) {
    return prisma.homeBanner.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
      take: limit,
      select: {
        id: true,
        title: true,
        imagePath: true,
        destinationUrl: true,
        altText: true,
        displayOrder: true,
      },
    });
  }
}
