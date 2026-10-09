import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AuthenticationService } from '../../authentication/application/AuthenticationService.js';
import { AuthenticationError } from '../../authentication/domain/AuthenticationError.js';
import type { HomeBannerService } from '../application/HomeBannerService.js';
import type {
  HomeBannerImageUploadRequestDto,
  ManagedHomeBannerInputDto,
  ReorderHomeBannersDto,
} from '@traderlab/contracts';

const bannerInputSchema = {
  type: 'object',
  required: ['internalName', 'description', 'eyebrowText', 'overlayText', 'imagePath', 'destinationUrl', 'altText'],
  additionalProperties: false,
  properties: {
    internalName: { type: 'string', maxLength: 180 },
    description: { type: 'string', maxLength: 20000 },
    eyebrowText: { type: 'string', maxLength: 180 },
    overlayText: { type: 'string', maxLength: 500 },
    imagePath: { type: 'string', maxLength: 300 },
    destinationUrl: { type: 'string', maxLength: 2048 },
    altText: { type: 'string', maxLength: 500 },
  },
} as const;

function accessToken(request: FastifyRequest): string {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AuthenticationError('Entre novamente para continuar.', 401);
  }
  return header.slice('Bearer '.length);
}

export async function homeBannerRoutes(
  app: FastifyInstance,
  options: {
    authentication: AuthenticationService;
    service: HomeBannerService;
  },
): Promise<void> {
  app.get('/home/banners', async (request) => {
    await options.authentication.getCurrentUser(
      accessToken(request),
    );
    return options.service.listPublished();
  });

  app.get('/admin/banners', async (request) => {
    await options.authentication.getCurrentAdministrator(accessToken(request));
    return options.service.listForAdmin();
  });

  app.get<{ Params: { bannerId: number } }>('/admin/banners/:bannerId', {
    schema: { params: { type: 'object', required: ['bannerId'], additionalProperties: false, properties: { bannerId: { type: 'integer', minimum: 1 } } } },
  }, async (request, reply) => {
    await options.authentication.getCurrentAdministrator(accessToken(request));
    const banner = await options.service.getForAdmin(request.params.bannerId);
    if (!banner) return reply.code(404).send({ message: 'Banner não encontrado.' });
    return banner;
  });

  app.post<{ Body: HomeBannerImageUploadRequestDto }>(
    '/admin/banners/upload-url',
    {
      schema: {
        body: {
          type: 'object', required: ['contentType', 'sizeBytes'], additionalProperties: false,
          properties: {
            contentType: { type: 'string', enum: ['image/jpeg', 'image/png', 'image/webp'] },
            sizeBytes: { type: 'integer', minimum: 1, maximum: 5242880 },
          },
        },
      },
    },
    async (request) => {
      await options.authentication.getCurrentAdministrator(accessToken(request));
      return options.service.createImageUpload(request.body);
    },
  );

  app.post<{ Body: ManagedHomeBannerInputDto }>(
    '/admin/banners',
    { schema: { body: bannerInputSchema } },
    async (request, reply) => {
      const administrator = await options.authentication.getCurrentAdministrator(accessToken(request));
      const banner = await options.service.create(request.body, administrator.id);
      return reply.code(201).send(banner);
    },
  );

  app.patch<{ Params: { bannerId: number }; Body: ManagedHomeBannerInputDto }>(
    '/admin/banners/:bannerId',
    { schema: { params: { type: 'object', required: ['bannerId'], additionalProperties: false, properties: { bannerId: { type: 'integer', minimum: 1 } } }, body: bannerInputSchema } },
    async (request) => {
      const administrator = await options.authentication.getCurrentAdministrator(accessToken(request));
      return options.service.update(request.params.bannerId, request.body, administrator.id);
    },
  );

  app.patch<{ Params: { bannerId: number }; Body: { status: 'published' | 'draft' } }>(
    '/admin/banners/:bannerId/status',
    {
      schema: {
        params: { type: 'object', required: ['bannerId'], additionalProperties: false, properties: { bannerId: { type: 'integer', minimum: 1 } } },
        body: { type: 'object', required: ['status'], additionalProperties: false, properties: { status: { type: 'string', enum: ['published', 'draft'] } } },
      },
    },
    async (request) => {
      const administrator = await options.authentication.getCurrentAdministrator(accessToken(request));
      return options.service.updateStatus(request.params.bannerId, request.body.status, administrator.id);
    },
  );

  app.patch<{ Body: ReorderHomeBannersDto }>(
    '/admin/banners/order',
    {
      schema: { body: { type: 'object', required: ['ids'], additionalProperties: false, properties: { ids: { type: 'array', maxItems: 5, items: { type: 'integer', minimum: 1 } } } } },
    },
    async (request) => {
      const administrator = await options.authentication.getCurrentAdministrator(accessToken(request));
      return options.service.reorder(request.body, administrator.id);
    },
  );
}
