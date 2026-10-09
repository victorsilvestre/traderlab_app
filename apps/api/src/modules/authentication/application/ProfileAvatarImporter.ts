export interface ProfileAvatarImporter {
  importProviderAvatar(userId: string, url: string): Promise<string | null>;
}
