import type { NextConfig } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseStorage = supabaseUrl ? new URL(supabaseUrl) : null;
const courseImagesBucket = process.env.NEXT_PUBLIC_COURSE_IMAGES_BUCKET ?? 'traderlab-course-images';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['admin.localhost'],
  images: {
    qualities: [90],
    remotePatterns: supabaseStorage
      ? [
        {
          protocol: supabaseStorage.protocol.slice(0, -1) as 'http' | 'https',
          hostname: supabaseStorage.hostname,
          port: supabaseStorage.port,
          pathname: `/storage/v1/object/sign/${courseImagesBucket}/**`,
        },
        {
          protocol: supabaseStorage.protocol.slice(0, -1) as 'http' | 'https',
          hostname: supabaseStorage.hostname,
          port: supabaseStorage.port,
          pathname: `/storage/v1/render/image/public/${courseImagesBucket}/**`,
        },
      ]
      : [],
  },
};

export default nextConfig;
