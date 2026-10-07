import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AuthenticationService } from '../../authentication/application/AuthenticationService.js';
import { AuthenticationError } from '../../authentication/domain/AuthenticationError.js';
import type { ContentProgressService } from '../application/ContentProgressService.js';

function accessToken(request: FastifyRequest): string {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AuthenticationError('Entre novamente para continuar.', 401);
  }
  return header.slice('Bearer '.length);
}

export async function progressRoutes(
  app: FastifyInstance,
  options: {
    authentication: AuthenticationService;
    service: ContentProgressService;
  },
): Promise<void> {
  app.get('/progress/recent-contents', async (request) => {
    const profile = await options.authentication.getCurrentUser(
      accessToken(request),
    );
    return options.service.listRecentForStudent(profile.id);
  });
}
