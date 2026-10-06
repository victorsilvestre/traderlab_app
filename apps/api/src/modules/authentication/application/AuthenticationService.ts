import type { SignInDto, UserProfileDto } from '@traderlab/contracts';
import { AuthenticationError } from '../domain/AuthenticationError.js';
import type { UserProfileRepository } from '../domain/UserProfile.js';
import type {
  AuthenticationProvider,
  AuthenticatedIdentity,
} from './AuthenticationProvider.js';

const genericSignUpMessage =
  'Se a conta puder ser criada, enviaremos um e-mail com as instruções de confirmação.';
const genericRecoveryMessage =
  'Se houver uma conta associada a esse e-mail, enviaremos as instruções para redefinir a senha.';

export class AuthenticationService {
  constructor(
    private readonly provider: AuthenticationProvider,
    private readonly profiles: UserProfileRepository,
    private readonly webAppUrl: string,
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

    const profile = await this.resolveProfile(result.identity);

    return {
      session: result.session,
      user: profile,
    };
  }

  async resendConfirmation(email: string): Promise<{ message: string }> {
    try {
      await this.provider.resendConfirmation(
        email.trim().toLowerCase(),
        `${this.webAppUrl}/auth/callback`,
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

  async requestPasswordRecovery(email: string): Promise<{ message: string }> {
    try {
      await this.provider.requestPasswordRecovery(
        email.trim().toLowerCase(),
        `${this.webAppUrl}/auth/callback?next=/password-reset`,
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

    return this.resolveProfile(identity);
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
    });
  }

  private validatePassword(password: string, confirmation: string): void {
    if (password.length < 6) {
      throw new AuthenticationError('A senha deve ter pelo menos 6 caracteres.', 400);
    }
    if (password !== confirmation) {
      throw new AuthenticationError('As senhas informadas não coincidem.', 400);
    }
  }
}
