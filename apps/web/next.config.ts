import type { NextConfig } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseStorage = supabaseUrl ? new URL(supabaseUrl) : null;
const courseImagesBucket = process.env.NEXT_PUBLIC_COURSE_IMAGES_BUCKET ?? 'traderlab-course-images';
const profileAvatarsBucket = process.env.NEXT_PUBLIC_PROFILE_AVATARS_BUCKET ?? 'traderlab-profile-avatars';

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    minimumCacheTTL: 60 * 60,
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
        {
          protocol: supabaseStorage.protocol.slice(0, -1) as 'http' | 'https',
          hostname: supabaseStorage.hostname,
          port: supabaseStorage.port,
          pathname: `/storage/v1/render/image/public/${profileAvatarsBucket}/**`,
        },
      ]
      : [],
  },
};

export default nextConfig;
