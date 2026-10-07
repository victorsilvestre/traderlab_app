import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AuthenticationService } from '../../authentication/application/AuthenticationService.js';
import { AuthenticationError } from '../../authentication/domain/AuthenticationError.js';
import type { UserService } from '../application/UserService.js';

type ProfileBody = { name?: string; phone?: string; avatarPath?: string };
type AvatarUploadBody = { contentType: string; sizeBytes: number };

function bearerToken(request: FastifyRequest): string {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AuthenticationError('Entre novamente para continuar.', 401);
  return header.slice('Bearer '.length);
}

export async function userRoutes(
  app: FastifyInstance,
  options: { authentication: AuthenticationService; service: UserService },
): Promise<void> {
  app.get('/users/me/profile', async (request) => {
    const identity = await options.authentication.getCurrentIdentity(bearerToken(request));
    return options.service.getProfile(identity);
  });

  app.patch<{ Body: ProfileBody }>(
    '/users/me/profile',
    {
      schema: {
        body: {
          type: 'object', additionalProperties: false, minProperties: 1,
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 120 },
            phone: { type: 'string', minLength: 5, maxLength: 30 },
            avatarPath: { type: 'string', minLength: 1, maxLength: 512 },
          },
        },
      },
    },
    async (request) => {
      const identity = await options.authentication.getCurrentIdentity(bearerToken(request));
      return options.service.updateProfile(identity, request.body);
    },
  );

  app.post<{ Body: AvatarUploadBody }>(
    '/users/me/profile/avatar-upload',
    {
      schema: {
        body: {
          type: 'object', required: ['contentType', 'sizeBytes'], additionalProperties: false,
          properties: {
            contentType: { type: 'string', maxLength: 100 },
            sizeBytes: { type: 'integer', minimum: 1, maximum: 5242880 },
          },
        },
      },
    },
    async (request) => {
      const identity = await options.authentication.getCurrentIdentity(bearerToken(request));
      return options.service.createAvatarUpload(identity, request.body);
    },
  );
}
