import type { NextConfig } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseStorage = supabaseUrl ? new URL(supabaseUrl) : null;

const nextConfig: NextConfig = {
  images: {
    qualities: [90],
    remotePatterns: supabaseStorage
      ? [{
          protocol: supabaseStorage.protocol.slice(0, -1) as 'http' | 'https',
          hostname: supabaseStorage.hostname,
          port: supabaseStorage.port,
          pathname: '/storage/v1/object/sign/traderlab-course-images/**',
        }]
      : [],
  },
};

export default nextConfig;
