
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
        hostname: 'cdn.myanimelist.net', // Add MyAnimeList CDN hostname (used by Jikan)
        port: '',
        pathname: '/**',
      },
      // Removed m.media-amazon.com as it wasn't in the previous config after last update
      // Removed s4.anilist.co
    ],
  },
  // Add webpack configuration to handle server-only modules
  webpack: (config, { isServer }) => {
    // Mark 'async_hooks' as external for the client bundle
    // This prevents client-side code from trying to bundle Node.js built-in modules
    // which are often dependencies of server-side packages like OpenTelemetry.
    if (!isServer) {
      // Add 'async_hooks' to externals if it's not already there
      config.externals = [...(config.externals || []), 'async_hooks'];
    }

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
