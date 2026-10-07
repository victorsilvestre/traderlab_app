import { createClient } from '@supabase/supabase-js';
import type { ProfileAvatarStorage } from '../domain/UserProfile.js';

const supabaseUrl = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_PROFILE_AVATARS_BUCKET ?? 'traderlab-profile-avatars';
if (!supabaseUrl || !secretKey) throw new Error('Supabase server credentials are required for profile avatars.');

const client = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
});

export class SupabaseProfileAvatarStorage implements ProfileAvatarStorage {
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
