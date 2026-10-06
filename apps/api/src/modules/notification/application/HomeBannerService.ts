import type { HomeBannerDto } from '@traderlab/contracts';
import { PrismaHomeBannerRepository } from '../infrastructure/PrismaHomeBannerRepository.js';

export class HomeBannerService {
  constructor(private readonly repository: PrismaHomeBannerRepository) {}

  async listPublished(): Promise<HomeBannerDto[]> {
    const banners = await this.repository.listPublished(5);
    return banners.map((banner) => ({
      id: banner.id,
      title: banner.title,
      imagePath: banner.imagePath,
      destinationUrl: banner.destinationUrl,
      altText: banner.altText,
      displayOrder: banner.displayOrder,
    }));
  }
}
