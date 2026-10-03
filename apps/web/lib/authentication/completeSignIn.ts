import type { SignInDto } from '@traderlab/contracts';

type SessionSetter = {
  setSession(tokens: {
    access_token: string;
    refresh_token: string;
  }): Promise<{ error: Error | null }>;
};

type Navigation = {
  replace(path: string): void;
  refresh(): void;
};

export async function completeSignIn(
  result: SignInDto,
  auth: SessionSetter,
  navigation: Navigation,
): Promise<void> {
  const { error } = await auth.setSession({
    access_token: result.session.accessToken,
    refresh_token: result.session.refreshToken,
  });
  if (error) throw error;

  navigation.replace('/');
  navigation.refresh();
}
