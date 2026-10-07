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

const signedUrlLifetimeSeconds = 60 * 60;
const signedUrlRefreshMarginMs = 10 * 60 * 1000;
const maximumCachedUrls = 1000;

export class SupabaseCourseImageStorage implements CourseImageStorage {
  private readonly readUrls = new Map<string, { url: string; expiresAt: number }>();
  private readonly pendingReadUrls = new Map<string, Promise<string>>();

  async createUpload(path: string): Promise<{ token: string }> {
    const { data, error } = await client.storage.from(bucketName).createSignedUploadUrl(path);
    if (error || !data) throw new Error('Could not issue a course image upload token.');
    return { token: data.token };
  }

  async createReadUrl(path: string): Promise<string> {
    const now = Date.now();
    const cached = this.readUrls.get(path);
    if (cached && cached.expiresAt - now > signedUrlRefreshMarginMs) {
      // Refresh insertion order so the map evicts the least recently used URL.
      this.readUrls.delete(path);
      this.readUrls.set(path, cached);
      return cached.url;
    }

    const pending = this.pendingReadUrls.get(path);
    if (pending) return pending;

    const requestStartedAt = now;
    const request = client.storage
      .from(bucketName)
      .createSignedUrl(path, signedUrlLifetimeSeconds)
      .then(({ data, error }) => {
        if (error || !data) throw new Error('Could not create a course image URL.');

        if (this.readUrls.size >= maximumCachedUrls) {
          const leastRecentlyUsedPath = this.readUrls.keys().next().value;
          if (leastRecentlyUsedPath) this.readUrls.delete(leastRecentlyUsedPath);
        }

        this.readUrls.set(path, {
          url: data.signedUrl,
          expiresAt: requestStartedAt + signedUrlLifetimeSeconds * 1000,
        });
        return data.signedUrl;
      })
      .finally(() => this.pendingReadUrls.delete(path));

    this.pendingReadUrls.set(path, request);
    return request;
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
