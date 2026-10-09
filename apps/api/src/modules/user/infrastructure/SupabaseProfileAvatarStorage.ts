import { createClient } from '@supabase/supabase-js';
import type { ProfileAvatarImporter } from '../../authentication/application/ProfileAvatarImporter.js';
import type { ProfileAvatarStorage } from '../domain/UserProfile.js';

const supabaseUrl = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_PROFILE_AVATARS_BUCKET ?? 'traderlab-profile-avatars';
const allowedAvatarHosts = new Set(['lh3.googleusercontent.com', 'googleusercontent.com']);
if (!supabaseUrl || !secretKey) throw new Error('Supabase server credentials are required for profile avatars.');

const client = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
});

export class SupabaseProfileAvatarStorage implements ProfileAvatarStorage, ProfileAvatarImporter {
  async importProviderAvatar(userId: string, url: string): Promise<string | null> {
    try {
      const source = new URL(url);
      if (source.protocol !== 'https:' || ![...allowedAvatarHosts].some((host) =>
        source.hostname === host || source.hostname.endsWith(`.${host}`),
      )) return null;

      const response = await fetch(source, { signal: AbortSignal.timeout(4000), redirect: 'error' });
      if (!response.ok) return null;
      const contentType = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase();
      const extension = contentType === 'image/jpeg' ? 'jpg'
        : contentType === 'image/png' ? 'png'
          : contentType === 'image/webp' ? 'webp' : null;
      const declaredLength = Number(response.headers.get('content-length') ?? 0);
      if (!extension || (declaredLength && declaredLength > 5 * 1024 * 1024)) return null;
      if (!response.body) return null;
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
        if (totalBytes > 5 * 1024 * 1024) {
          await reader.cancel();
          return null;
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      if (!bytes.length || bytes.length > 5 * 1024 * 1024 || !hasImageSignature(bytes, extension)) return null;

      const path = `${userId}/avatar-google-${crypto.randomUUID()}.${extension}`;
      const { error } = await client.storage.from(bucketName).upload(path, bytes.buffer, {
        contentType,
        upsert: false,
      });
      return error ? null : path;
    } catch {
      return null;
    }
  }

  async createUpload(path: string): Promise<{ token: string }> {
    const { data, error } = await client.storage.from(bucketName).createSignedUploadUrl(path);
    if (error || !data) throw new Error('Could not issue an avatar upload token.');
    return { token: data.token };
  }

  async createReadUrl(path: string): Promise<string> {
    const { data, error } = await client.storage.from(bucketName).createSignedUrl(path, 60 * 60);
    if (error || !data) throw new Error('Could not create a profile image URL.');
    return data.signedUrl;
  }

  async exists(path: string): Promise<boolean> {
    const directory = path.split('/')[0];
    const filename = path.split('/').at(-1);
    if (!directory || !filename) return false;
    const { data, error } = await client.storage.from(bucketName).list(directory, { search: filename, limit: 5 });
    return !error && Boolean(data?.some((file) => file.name === filename));
  }
}

function hasImageSignature(bytes: Uint8Array, extension: string): boolean {
  if (extension === 'jpg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (extension === 'png') return bytes.subarray(0, 8).join(',') === '137,80,78,71,13,10,26,10';
  return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
}
