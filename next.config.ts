
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
      {
          protocol: 'https',
          hostname: 'img.flawlessfiles.com',
          port: '',
          pathname: '/**',
      },
      {
          protocol: 'https',
          hostname: 'm.witanime.tv',
          port: '',
          pathname: '/**',
      },
      {
          protocol: 'https',
          hostname: 'animepahe.org',
          port: '',
          pathname: '/**',
      },
      // Removed m.media-amazon.com
      {
        protocol: 'https',
        hostname: 's4.anilist.co', // Add AniList CDN hostname
        port: '',
        pathname: '/**',
      },
      // Add AnimePahe snapshot host if needed
      {
        protocol: 'https',
        hostname: 'i.animepahe.ru', // Common host for AnimePahe snapshots/posters
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Add webpack configuration to handle server-only modules
  webpack: (config, { isServer }) => {
    // Mark server-only modules as external for the client bundle
    // This prevents client-side code from trying to bundle Node.js built-in modules
    // or heavy server-side libraries like JSDOM.
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        'async_hooks',
        'jsdom', // Add 'jsdom' to externals for the client bundle
        'child_process', // Also mark child_process as external
        'http', // Mark http as external
        'https', // Mark https as external
        'zlib', // Mark zlib as external
        'fs', // Mark fs as external
        'net', // Mark net as external
        'tls', // Mark tls as external
      ];
    }

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
