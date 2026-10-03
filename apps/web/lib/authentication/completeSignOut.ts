type LocalSignOutClient = {
  signOut(options: { scope: 'local' }): Promise<{ error: Error | null }>;
};

type Navigation = {
  replace(path: string): void;
  refresh(): void;
};

export async function completeSignOut(
  auth: LocalSignOutClient,
  navigation: Navigation,
): Promise<void> {
  const { error } = await auth.signOut({ scope: 'local' });
  if (error) throw error;

  navigation.replace('/sign-in');
  navigation.refresh();
}
