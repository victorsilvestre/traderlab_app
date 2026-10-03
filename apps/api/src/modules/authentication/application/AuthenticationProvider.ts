export type AuthenticatedIdentity = {
  id: string;
  email: string | null;
  emailConfirmed: boolean;
  name: string | null;
  phone: string | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
};

export type SignInResult = {
  identity: AuthenticatedIdentity;
  session: AuthSession;
};

export interface AuthenticationProvider {
  signUp(input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    emailRedirectTo: string;
  }): Promise<AuthenticatedIdentity | null>;
  resendConfirmation(email: string, redirectTo: string): Promise<void>;
  signIn(email: string, password: string): Promise<SignInResult>;
  requestPasswordRecovery(email: string, redirectTo: string): Promise<void>;
  getIdentity(accessToken: string): Promise<AuthenticatedIdentity | null>;
  updatePassword(userId: string, password: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
}
