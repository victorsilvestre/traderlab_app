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
    const profile = await options.authentication.getCurrentUser(
      accessToken(request),
    );
    if (profile.role !== 'student') {
      throw new AuthenticationError('Esta área é exclusiva para alunos.', 403);
    }
    return options.service.listPublished();
  });
}
