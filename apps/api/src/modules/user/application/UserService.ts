import type { UserProfileDetailsDto } from '@traderlab/contracts';
import type { AuthenticatedIdentity } from '../../authentication/application/AuthenticationProvider.js';
import type { ProfileAvatarStorage, UserProfileRepository } from '../domain/UserProfile.js';
import { UserError } from '../domain/UserError.js';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maximumBytes = 5 * 1024 * 1024;
const extensionByType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export class UserService {
  constructor(
    private readonly profiles: UserProfileRepository,
    private readonly avatars: ProfileAvatarStorage,
  ) {}

  async getProfile(identity: AuthenticatedIdentity): Promise<UserProfileDetailsDto> {
    const profile = await this.requireProfile(identity.id);
    return this.toView(profile, identity.email);
  }

  async updateProfile(
    identity: AuthenticatedIdentity,
    input: { name?: string; phone?: string; avatarPath?: string },
  ): Promise<UserProfileDetailsDto> {
    const update: { name?: string; phone?: string; avatarPath?: string } = {};
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new UserError('Informe seu nome.', 400);
      update.name = name;
    }
    if (input.phone !== undefined) {
      const phone = input.phone.trim();
      if (phone.length < 5) throw new UserError('Informe um telefone válido.', 400);
      update.phone = phone;
    }
    if (input.avatarPath !== undefined) {
      if (!input.avatarPath.startsWith(`${identity.id}/`) ||
          !/^[-\w]+\/avatar-[\w-]+\.(jpg|png|webp)$/.test(input.avatarPath)) {
        throw new UserError('O arquivo de avatar não é válido.', 400);
      }
      if (!(await this.avatars.exists(input.avatarPath))) {
        throw new UserError('Não foi possível localizar a imagem enviada.', 400);
      }
      update.avatarPath = input.avatarPath;
    }
    if (Object.keys(update).length === 0) {
      throw new UserError('Nenhuma alteração foi informada.', 400);
    }
    const profile = await this.profiles.update(identity.id, update);
    return this.toView(profile, identity.email);
  }

  async createAvatarUpload(
    identity: AuthenticatedIdentity,
    input: { contentType: string; sizeBytes: number },
  ): Promise<{ path: string; token: string }> {
    if (!allowedTypes.has(input.contentType)) {
      throw new UserError('Use uma imagem JPEG, PNG ou WebP.', 400);
    }
    if (!Number.isSafeInteger(input.sizeBytes) || input.sizeBytes < 1 || input.sizeBytes > maximumBytes) {
      throw new UserError('A imagem deve ter até 5 MB.', 400);
    }
    await this.requireProfile(identity.id);
    const path = `${identity.id}/avatar-${crypto.randomUUID()}.${extensionByType[input.contentType]}`;
    const { token } = await this.avatars.createUpload(path);
    return { path, token };
  }

  private async requireProfile(id: string) {
    const profile = await this.profiles.findById(id);
    if (!profile) throw new UserError('Perfil não encontrado.', 404);
    return profile;
  }

  private async toView(
    profile: Awaited<ReturnType<UserProfileRepository['findById']>> & {},
    email: string | null,
  ): Promise<UserProfileDetailsDto> {
    return {
      id: profile.id,
      name: profile.name,
      phone: profile.phone,
      role: profile.role,
      email,
      avatarUrl: profile.avatarPath
        ? await this.avatars.createReadUrl(profile.avatarPath)
        : null,
    };
  }
}
