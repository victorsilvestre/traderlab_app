import type { SignInDto, UserProfileDto } from '@traderlab/contracts';
import { AuthenticationError } from '../domain/AuthenticationError.js';
import type { UserProfileRepository } from '../domain/UserProfile.js';
import type {
  AuthenticationProvider,
  AuthenticatedIdentity,
} from './AuthenticationProvider.js';
import type { ProfileAvatarImporter } from './ProfileAvatarImporter.js';

const genericSignUpMessage =
  'Se a conta puder ser criada, enviaremos um e-mail com as instruções de confirmação.';
const genericRecoveryMessage =
  'Se houver uma conta associada a esse e-mail, enviaremos as instruções para redefinir a senha.';

export class AuthenticationService {
  constructor(
    private readonly provider: AuthenticationProvider,
    private readonly profiles: UserProfileRepository,
    private readonly webAppUrl: string,
    private readonly adminAppUrl?: string,
    private readonly avatars?: ProfileAvatarImporter,
  ) {}

  async signUp(input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    passwordConfirmation: string;
  }): Promise<{ message: string }> {
    this.validatePassword(input.password, input.passwordConfirmation);

    const identity = await this.provider.signUp({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      password: input.password,
      emailRedirectTo: `${this.webAppUrl}/auth/callback`,
    });

    if (!identity) return { message: genericSignUpMessage };

    try {
      await this.profiles.createForStudent({
        id: identity.id,
        name: identity.name ?? input.name.trim(),
        phone: identity.phone ?? input.phone.trim(),
        email: identity.email,
      });
    } catch {
      await this.provider.deleteUser(identity.id).catch(() => undefined);
      throw new AuthenticationError(
        'Não foi possível concluir o cadastro agora. Tente novamente.',
        503,
      );
    }

    return { message: genericSignUpMessage };
  }

  async signIn(email: string, password: string): Promise<SignInDto> {
    const result = await this.authenticate(email, password);
    const profile = await this.resolveProfile(result.identity);
    await this.recordSuccessfulLogin(result.identity);

    return { session: result.session, user: profile };
  }

  async signInForWorkspace(email: string, password: string): Promise<SignInDto> {
    const result = await this.authenticate(email, password);
    const profile = await this.profiles.findById(result.identity.id);
    if (!profile || (profile.role !== 'mentor' && profile.role !== 'administrator')) {
      throw new AuthenticationError('Este perfil não tem acesso ao ambiente de gestão.', 403);
    }
    await this.recordSuccessfulLogin(result.identity);
    return { session: result.session, user: profile };
  }

  private async authenticate(email: string, password: string) {
    let result;
    try {
      result = await this.provider.signIn(email.trim().toLowerCase(), password);
    } catch (cause) {
      const status =
        typeof cause === 'object' && cause !== null && 'status' in cause
          ? cause.status
          : undefined;
      if (typeof status !== 'number' || status >= 500) {
        throw new AuthenticationError(
          'O serviço de autenticação está indisponível. Tente novamente em instantes.',
          503,
          { cause },
        );
      }
      throw new AuthenticationError(
        'Não foi possível entrar. Confira seus dados e a confirmação do e-mail.',
        401,
      );
    }

    if (!result.identity.emailConfirmed) {
      throw new AuthenticationError(
        'Confirme seu e-mail antes de entrar na plataforma.',
        403,
      );
    }

    return result;
  }

  async resendConfirmation(
    email: string,
    destination: 'web' | 'admin' = 'web',
  ): Promise<{ message: string }> {
    try {
      await this.provider.resendConfirmation(
        email.trim().toLowerCase(),
        `${this.callbackOrigin(destination)}/auth/callback`,
      );
    } catch (cause) {
      throw new AuthenticationError(
        'Não foi possível processar a solicitação agora. Tente novamente.',
        503,
        { cause },
      );
    }

    return {
      message: 'Se houver uma conta aguardando confirmação para esse e-mail, enviaremos um novo link.',
    };
  }

  async requestPasswordRecovery(
    email: string,
    destination: 'web' | 'admin' = 'web',
  ): Promise<{ message: string }> {
    try {
      await this.provider.requestPasswordRecovery(
        email.trim().toLowerCase(),
        `${this.callbackOrigin(destination)}/auth/callback?next=/password-reset`,
      );
    } catch (cause) {
      const code =
        typeof cause === 'object' && cause !== null && 'code' in cause
          ? cause.code
          : undefined;
      if (code === 'over_email_send_rate_limit') {
        throw new AuthenticationError(
          'O serviço de e-mail atingiu o limite temporário de envios. Aguarde um pouco antes de tentar novamente.',
          429,
          { cause },
        );
      }
      throw new AuthenticationError(
        'Não foi possível processar a solicitação agora. Tente novamente.',
        503,
        { cause },
      );
    }

    return { message: genericRecoveryMessage };
  }

  async resetPassword(input: {
    accessToken: string;
    password: string;
    passwordConfirmation: string;
  }): Promise<{ message: string }> {
    this.validatePassword(input.password, input.passwordConfirmation);
    const identity = await this.provider.getIdentity(input.accessToken);

    if (!identity) {
      throw new AuthenticationError(
        'Este link não é mais válido. Solicite uma nova redefinição de senha.',
        401,
      );
    }

    try {
      await this.provider.updatePassword(identity.id, input.password);
    } catch {
      throw new AuthenticationError(
        'Não foi possível atualizar a senha. Solicite um novo link e tente novamente.',
        400,
      );
    }

    return { message: 'Senha atualizada. Você já pode entrar com a nova senha.' };
  }

  async getCurrentUser(accessToken: string): Promise<UserProfileDto> {
    return this.requireCompleteProfile(await this.resolveProfile(await this.verifyIdentity(accessToken)));
  }

  async completeExternalSignIn(accessToken: string): Promise<{ profile: UserProfileDto; requiresPhone: boolean }> {
    const identity = await this.verifyIdentity(accessToken);
    if (!identity.providers?.includes('google')) {
      throw new AuthenticationError('Esta operação está disponível somente para uma sessão do Google.', 403);
    }
    const existing = await this.profiles.findById(identity.id);
    const profile = existing ?? await this.profiles.createForStudent({
      id: identity.id,
      name: identity.name ?? '',
      phone: identity.phone ?? '',
      email: identity.email,
    });
    if (!existing && identity.avatarUrl && this.avatars) {
      try {
        const avatarPath = await this.avatars.importProviderAvatar(identity.id, identity.avatarUrl);
        if (avatarPath) {
          // Profile creation and avatar storage are independent; profile edits remain authoritative.
          await this.profiles.updateAvatarPath?.(identity.id, avatarPath);
        }
      } catch {
        // Avatar is optional and must never prevent a successful sign-in.
      }
    }
    await this.recordSuccessfulLogin(identity);
    const saved = await this.profiles.findById(identity.id) ?? profile;
    return { profile: saved, requiresPhone: !saved.phone.trim() };
  }

  async getCurrentWorkspaceUser(accessToken: string): Promise<UserProfileDto> {
    const identity = await this.verifyIdentity(accessToken);
    const profile = await this.profiles.findById(identity.id);
    if (!profile || (profile.role !== 'mentor' && profile.role !== 'administrator')) {
      throw new AuthenticationError('Este perfil não tem acesso ao ambiente de gestão.', 403);
    }
    return this.requireCompleteProfile(profile);
  }

  async getCurrentAdministrator(accessToken: string): Promise<UserProfileDto> {
    const identity = await this.verifyIdentity(accessToken);
    const profile = await this.profiles.findById(identity.id);
    if (!profile || profile.role !== 'administrator') {
      throw new AuthenticationError(
        'Esta funcionalidade está disponível somente para administradores.',
        403,
      );
    }
    return this.requireCompleteProfile(profile);
  }

  async getCurrentIdentity(accessToken: string): Promise<AuthenticatedIdentity> {
    const identity = await this.verifyIdentity(accessToken);
    await this.resolveProfile(identity);
    return identity;
  }

  private async verifyIdentity(accessToken: string): Promise<AuthenticatedIdentity> {
    let identity: AuthenticatedIdentity | null;
    try {
      identity = await this.provider.getIdentity(accessToken);
    } catch (cause) {
      throw new AuthenticationError(
        'Não foi possível validar sua sessão agora. Tente novamente.',
        503,
        { cause },
      );
    }

    if (!identity) {
      throw new AuthenticationError('Sua sessão expirou. Entre novamente.', 401);
    }

    return identity;
  }

  private async resolveProfile(
    identity: AuthenticatedIdentity,
  ): Promise<UserProfileDto> {
    const existing = await this.profiles.findById(identity.id);
    if (existing) return existing;

    return this.profiles.createForStudent({
      id: identity.id,
      name: identity.name ?? '',
      phone: identity.phone ?? '',
      email: identity.email,
    });
  }

  private requireCompleteProfile(profile: UserProfileDto): UserProfileDto {
    if (!profile.phone.trim()) {
      throw new AuthenticationError('Complete seu telefone para continuar.', 403);
    }
    return profile;
  }

  private async recordSuccessfulLogin(identity: AuthenticatedIdentity): Promise<void> {
    await this.profiles.recordSuccessfulLogin(identity.id, identity.email, new Date());
  }

  private validatePassword(password: string, confirmation: string): void {
    if (password.length < 6) {
      throw new AuthenticationError('A senha deve ter pelo menos 6 caracteres.', 400);
    }
    if (password !== confirmation) {
      throw new AuthenticationError('As senhas informadas não coincidem.', 400);
    }
  }

  private callbackOrigin(destination: 'web' | 'admin'): string {
    if (destination === 'web') return this.webAppUrl;
    if (this.adminAppUrl) return this.adminAppUrl;
    throw new AuthenticationError('O acesso administrativo não está configurado.', 503);
  }
}
