import type {
  HomeBannerDto,
  HomeBannerImageUploadRequestDto,
  ManagedHomeBannerDto,
  ManagedHomeBannerInputDto,
  ManagedHomeBannersDto,
  ReorderHomeBannersDto,
} from '@traderlab/contracts';
import { randomUUID } from 'node:crypto';
import { PrismaHomeBannerRepository } from '../infrastructure/PrismaHomeBannerRepository.js';
import { HomeBannerError } from '../domain/HomeBannerError.js';

export interface HomeBannerImageStorage {
  createUpload(path: string): Promise<{ token: string }>;
  createReadUrl(path: string): Promise<string>;
  exists(path: string): Promise<boolean>;
}

const allowedContentTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);
const activeLimit = 5 as const;

export class HomeBannerService {
  constructor(
    private readonly repository: PrismaHomeBannerRepository,
    private readonly images: HomeBannerImageStorage,
    private readonly publicAssetsBaseUrl: string,
  ) {}

  async listPublished(): Promise<HomeBannerDto[]> {
    const banners = await this.repository.listPublished(activeLimit);
    return Promise.all(banners.map(async (banner) => ({
      id: banner.id,
      title: banner.title,
      eyebrowText: banner.eyebrowText,
      description: banner.description,
      overlayText: banner.overlayText,
      imageUrl: await this.imageUrl(banner.imagePath),
      destinationUrl: banner.destinationUrl,
      altText: banner.altText,
      displayOrder: banner.displayOrder,
    })));
  }

  async listForAdmin(): Promise<ManagedHomeBannersDto> {
    const banners = await this.repository.listForAdmin();
    const items: ManagedHomeBannerDto[] = await Promise.all(banners.map(async (banner) => ({
      id: banner.id,
      internalName: banner.internalName,
      title: banner.title,
      description: banner.description,
      eyebrowText: banner.eyebrowText,
      overlayText: banner.overlayText,
      imageUrl: await this.imageUrl(banner.imagePath),
      imagePath: banner.imagePath,
      destinationUrl: banner.destinationUrl,
      altText: banner.altText,
      displayOrder: banner.displayOrder,
      status: banner.status === 'PUBLISHED' ? 'published' : 'draft',
    })));
    return { items, activeCount: items.filter((item) => item.status === 'published').length, activeLimit };
  }

  async getForAdmin(id: number): Promise<ManagedHomeBannerDto | null> {
    const banner = await this.repository.findForAdmin(id);
    if (!banner) return null;
    return {
      id: banner.id, internalName: banner.internalName, title: banner.title, description: banner.description,
      eyebrowText: banner.eyebrowText, overlayText: banner.overlayText, imageUrl: await this.imageUrl(banner.imagePath),
      imagePath: banner.imagePath, destinationUrl: banner.destinationUrl, altText: banner.altText,
      displayOrder: banner.displayOrder, status: banner.status === 'PUBLISHED' ? 'published' : 'draft',
    };
  }

  async createImageUpload(input: HomeBannerImageUploadRequestDto) {
    const extension = allowedContentTypes.get(input.contentType);
    if (!extension) throw new HomeBannerError('Use uma imagem JPEG, PNG ou WebP.', 400);
    if (!Number.isSafeInteger(input.sizeBytes) || input.sizeBytes < 1 || input.sizeBytes > 5 * 1024 * 1024) {
      throw new HomeBannerError('A imagem deve ter até 5 MB.', 400);
    }
    const path = `banners/${randomUUID()}.${extension}`;
    const upload = await this.images.createUpload(path);
    return { path, token: upload.token };
  }

  async create(input: ManagedHomeBannerInputDto, administratorId: string) {
    const internalName = this.requiredText(input.internalName, 'o nome interno', 180);
    const title = this.requiredText(input.title, 'o título', 180);
    const description = (input.description ?? '').trim();
    const eyebrowText = (input.eyebrowText ?? '').trim() || null;
    const overlayText = (input.overlayText ?? '').trim() || null;
    const altText = this.requiredText(input.altText, 'o texto alternativo', 500);
    if (description.length > 20000) throw new HomeBannerError('A descrição deve ter até 20000 caracteres.', 400);
    if (eyebrowText && eyebrowText.length > 180) throw new HomeBannerError('A chamada curta deve ter até 180 caracteres.', 400);
    if (overlayText && overlayText.length > 500) throw new HomeBannerError('O texto da vitrine deve ter até 500 caracteres.', 400);
    const imagePath = (input.imagePath ?? '').trim();
    if (!/^banners\/[a-f0-9-]+\.(?:jpg|png|webp)$/i.test(imagePath) || !(await this.images.exists(imagePath))) {
      throw new HomeBannerError('Envie uma imagem válida antes de salvar o banner.', 400);
    }
    const destinationUrl = this.normalizeDestination(input.destinationUrl);
    const result = await this.runWithConflictMessage(() => this.repository.create({
      internalName, title, description, eyebrowText, overlayText, imagePath, destinationUrl, altText, administratorId,
    }));
    if (result.limitReached) throw new HomeBannerError('Já existem cinco banners ativos. Inative um banner antes de cadastrar outro.', 409);
    const banner = result.banner;
    return {
      id: banner.id,
      internalName: banner.internalName,
      title: banner.title,
      description: banner.description,
      eyebrowText: banner.eyebrowText,
      overlayText: banner.overlayText,
      imageUrl: await this.imageUrl(banner.imagePath),
      destinationUrl: banner.destinationUrl,
      altText: banner.altText,
      displayOrder: banner.displayOrder,
      status: 'published' as const,
    };
  }

  async updateStatus(id: number, status: 'published' | 'draft', administratorId: string) {
    const result = await this.runWithConflictMessage(() => this.repository.updateStatus(id, status === 'published' ? 'PUBLISHED' : 'DRAFT', administratorId));
    if ('missing' in result && result.missing) throw new HomeBannerError('Banner não encontrado.', 404);
    if ('limitReached' in result && result.limitReached) throw new HomeBannerError('Já existem cinco banners ativos. Inative um antes de ativar outro.', 409);
    return { message: status === 'published' ? 'Banner ativado.' : 'Banner inativado.' };
  }

  async update(id: number, input: ManagedHomeBannerInputDto, administratorId: string) {
    const internalName = this.requiredText(input.internalName, 'o nome interno', 180);
    const title = this.requiredText(input.title, 'o título', 180);
    const description = (input.description ?? '').trim();
    const eyebrowText = (input.eyebrowText ?? '').trim() || null;
    const overlayText = (input.overlayText ?? '').trim() || null;
    const altText = this.requiredText(input.altText, 'o texto alternativo', 500);
    if (description.length > 20000) throw new HomeBannerError('A descrição deve ter até 20000 caracteres.', 400);
    if (eyebrowText && eyebrowText.length > 180) throw new HomeBannerError('A chamada curta deve ter até 180 caracteres.', 400);
    if (overlayText && overlayText.length > 500) throw new HomeBannerError('O texto da vitrine deve ter até 500 caracteres.', 400);
    const imagePath = (input.imagePath ?? '').trim();
    const staticBannerPath = /^\/banners\/[a-z0-9._-]+\.svg$/i.test(imagePath);
    if (!staticBannerPath && (!/^banners\/[a-f0-9-]+\.(?:jpg|png|webp)$/i.test(imagePath) || !(await this.images.exists(imagePath)))) {
      throw new HomeBannerError('Envie uma imagem válida antes de salvar o banner.', 400);
    }
    const destinationUrl = this.normalizeDestination(input.destinationUrl);
    const banner = await this.runWithConflictMessage(() => this.repository.update(id, {
      internalName, title, description, eyebrowText, overlayText, imagePath, destinationUrl, altText, administratorId,
    }));
    if (!banner) throw new HomeBannerError('Banner não encontrado.', 404);
    return {
      id: banner.id, internalName: banner.internalName, title: banner.title, description: banner.description,
      eyebrowText: banner.eyebrowText, overlayText: banner.overlayText, imageUrl: await this.imageUrl(banner.imagePath),
      imagePath: banner.imagePath, destinationUrl: banner.destinationUrl, altText: banner.altText,
      displayOrder: banner.displayOrder, status: banner.status === 'PUBLISHED' ? 'published' as const : 'draft' as const,
    };
  }

  async reorder(input: ReorderHomeBannersDto, administratorId: string) {
    if (!Array.isArray(input.ids) || input.ids.length > activeLimit || input.ids.some((id) => !Number.isSafeInteger(id) || id < 1)) {
      throw new HomeBannerError('A ordem informada não é válida.', 400);
    }
    const saved = await this.runWithConflictMessage(() => this.repository.reorder(input.ids, administratorId));
    if (!saved) throw new HomeBannerError('A lista de banners ativos mudou. Atualize a página e tente novamente.', 409);
    return { message: 'Ordem dos banners atualizada.' };
  }

  private async imageUrl(path: string) {
    return path.startsWith('/') ? new URL(path, this.publicAssetsBaseUrl).toString() : this.images.createReadUrl(path);
  }

  private async runWithConflictMessage<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2034') {
        throw new HomeBannerError('Outro administrador alterou os banners ao mesmo tempo. Atualize a lista e tente novamente.', 409);
      }
      throw error;
    }
  }

  private requiredText(value: string | undefined, label: string, max: number) {
    const normalized = (value ?? '').trim();
    if (!normalized) throw new HomeBannerError(`Informe ${label}.`, 400);
    if (normalized.length > max) throw new HomeBannerError(`${label} deve ter até ${max} caracteres.`, 400);
    return normalized;
  }

  private normalizeDestination(value: string | null | undefined) {
    const input = (value ?? '').trim();
    if (!input) return null;
    let url: URL;
    try { url = new URL(input); } catch { throw new HomeBannerError('Informe uma URL HTTP ou HTTPS válida.', 400); }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new HomeBannerError('Use uma URL HTTP ou HTTPS.', 400);
    return url.toString();
  }
}
