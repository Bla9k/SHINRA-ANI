
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's4.anilist.co', // Add AniList image hostname
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Add webpack configuration to handle server-only modules
  webpack: (config, { isServer }) => {
    // Mark 'async_hooks' as external for the client bundle
    // This prevents client-side code from trying to bundle Node.js built-in modules
    // which are often dependencies of server-side packages like OpenTelemetry.
    if (!isServer) {
      config.externals = [...(config.externals || []), 'async_hooks'];
    }

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
