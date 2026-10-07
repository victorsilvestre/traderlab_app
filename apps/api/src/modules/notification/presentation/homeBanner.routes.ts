import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AuthenticationService } from '../../authentication/application/AuthenticationService.js';
import { AuthenticationError } from '../../authentication/domain/AuthenticationError.js';
import type { HomeBannerService } from '../application/HomeBannerService.js';

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
}
