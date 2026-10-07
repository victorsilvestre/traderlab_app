import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_PROFILE_AVATARS_BUCKET ?? 'traderlab-profile-avatars';
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

if (!supabaseUrl || !serviceKey) throw new Error('SUPABASE_URL and a server service key are required.');

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
});

const { data: bucket, error } = await supabase.storage.getBucket(bucketName);
if (error && !/not found|does not exist/i.test(error.message)) {
  throw new Error('Could not inspect the profile avatars storage bucket.');
}

const config = { public: false, fileSizeLimit: 5 * 1024 * 1024, allowedMimeTypes };
if (error) {
  const result = await supabase.storage.createBucket(bucketName, config);
  if (result.error) throw new Error('Could not create the private profile avatars bucket.');
} else if (bucket) {
  const result = await supabase.storage.updateBucket(bucketName, config);
  if (result.error) throw new Error('Could not configure the profile avatars bucket.');
}

const verified = await supabase.storage.getBucket(bucketName);
const verifiedTypes = [...(verified.data?.allowed_mime_types ?? [])].sort();
if (
  verified.error ||
  !verified.data ||
  verified.data.public ||
  verified.data.file_size_limit !== config.fileSizeLimit ||
  JSON.stringify(verifiedTypes) !== JSON.stringify([...allowedMimeTypes].sort())
) {
  throw new Error('Profile avatars bucket verification failed.');
}

console.log(JSON.stringify({ bucket: bucketName, public: false, fileSizeLimit: config.fileSizeLimit, allowedMimeTypes }));
