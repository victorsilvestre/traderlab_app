import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName =
  process.env.SUPABASE_COURSE_MATERIALS_BUCKET ?? 'traderlab-course-materials';

if (!supabaseUrl || !serviceKey) {
  throw new Error('SUPABASE_URL and a server service key are required.');
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

const { data: bucket, error } = await supabase.storage.getBucket(bucketName);
let created = false;

if (error) {
  if (!/not found|does not exist/i.test(error.message)) {
    throw new Error('Could not inspect the course materials storage bucket.');
  }

  const result = await supabase.storage.createBucket(bucketName, {
    public: false,
  });
  if (result.error) {
    throw new Error('Could not create the private course materials bucket.');
  }
  created = true;
} else if (bucket?.public) {
  const result = await supabase.storage.updateBucket(bucketName, {
    public: false,
  });
  if (result.error) {
    throw new Error('Could not make the course materials bucket private.');
  }
}

const verified = await supabase.storage.getBucket(bucketName);
if (verified.error || !verified.data || verified.data.public) {
  throw new Error('Course materials bucket verification failed.');
}

console.log(
  JSON.stringify({ bucket: bucketName, public: false, created }),
);
