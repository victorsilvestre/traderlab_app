import { createClient } from '@supabase/supabase-js';
import type { CourseMaterialStorage } from '../domain/Course.js';

const supabaseUrl = process.env.SUPABASE_URL;
const secretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName =
  process.env.SUPABASE_COURSE_MATERIALS_BUCKET ?? 'traderlab-course-materials';

if (!supabaseUrl || !secretKey) {
  throw new Error(
    'Supabase server credentials are required for course materials.',
  );
}

const client = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

export class SupabaseCourseMaterialStorage implements CourseMaterialStorage {
  async createUpload(storagePath: string): Promise<{ token: string }> {
    const { data, error } = await client.storage
      .from(bucketName)
      .createSignedUploadUrl(storagePath);
    if (error || !data)
      throw (
        error ?? new Error('Could not issue a course material upload token.')
      );
    return { token: data.token };
  }

  async exists(storagePath: string): Promise<boolean> {
    const [folder, ...segments] = storagePath.split('/');
    const filename = segments.at(-1);
    if (!folder || !filename) return false;
    const directory = segments.slice(0, -1).join('/');
    const { data, error } = await client.storage
      .from(bucketName)
      .list(directory ? `${folder}/${directory}` : folder, {
        search: filename,
        limit: 5,
      });
    return !error && Boolean(data?.some((file) => file.name === filename));
  }

  async download(storagePath: string): Promise<Uint8Array> {
    const { data, error } = await client.storage
      .from(bucketName)
      .download(storagePath);
    if (error || !data) {
      throw error ?? new Error('Supabase did not return the course material.');
    }
    return new Uint8Array(await data.arrayBuffer());
  }
}
