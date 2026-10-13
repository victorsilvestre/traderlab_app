import { createClient } from '@supabase/supabase-js';
import type { CourseImageStorage } from '../domain/Course.js';

const supabaseUrl = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_COURSE_IMAGES_BUCKET ?? 'traderlab-course-images';

if (!supabaseUrl || !secretKey) {
  throw new Error('Supabase server credentials are required for course images.');
}

const client = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
});

export class SupabaseCourseImageStorage implements CourseImageStorage {
  async createUpload(path: string): Promise<{ token: string }> {
    const { data, error } = await client.storage.from(bucketName).createSignedUploadUrl(path);
    if (error || !data) throw new Error('Could not issue a course image upload token.');
    return { token: data.token };
  }

  async createReadUrl(path: string): Promise<string> {
    const width = path.startsWith('banners/') ? 1440 : 1600;
    const { data } = client.storage.from(bucketName).getPublicUrl(path, {
      transform: { width, resize: 'contain', quality: 75 },
    });
    return data.publicUrl;
  }

  async exists(path: string): Promise<boolean> {
    const [folder, ...segments] = path.split('/');
    const filename = segments.at(-1);
    if (!folder || !filename) return false;
    const directory = segments.slice(0, -1).join('/');
    const { data, error } = await client.storage.from(bucketName).list(
      directory ? `${folder}/${directory}` : folder,
      { search: filename, limit: 5 },
    );
    return !error && Boolean(data?.some((file) => file.name === filename));
  }
}
