
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
       // Add Chrome Cast hosts if needed (less likely to fix the specific error)
      {
        protocol: 'https',
        hostname: 'www.gstatic.com',
      },
    ],
  },
  // Add webpack configuration to handle server-only modules
  webpack: (config, { isServer }) => {
    // Mark server-only modules as external for the client bundle
    // This prevents client-side code from trying to bundle Node.js built-in modules.
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        'async_hooks',
        // 'jsdom', // Removed jsdom - usage confined to API routes now
        'child_process', // Keep other Node built-ins external
        'http',
        'https',
        'zlib',
        'fs',
        'net',
        'tls',
      ];
    }

    // Important: return the modified config
    return config;
  },
  async headers() {
      return [
        {
          // Apply these headers to all routes in your application
          source: '/:path*',
          headers: [
            {
              key: 'Permissions-Policy',
              // Add 'presentation' permission
              value: 'autoplay=*, fullscreen=*, display-capture=*, presentation=*',
            },
          ],
        },
      ];
  },
};

export default nextConfig;
