import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverRuntimeConfig: {
    port: 3004
  },
  reactStrictMode: false,
   devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  redirects: async () => {
    return [
      // {
      //   source: '/',
      //   destination: '/',
      //   permanent: true,
      // },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatars.githubusercontent.com',
      },
      {
        hostname: 'mixin-images.zeromesh.net',
      },
      {
        hostname: 'raw.githubusercontent.com',
      },
      {
        hostname: 'kernel.mixin.dev',
      },
      {
        hostname: 'mixin.one',
      },
      {
        hostname: 'pbs.twimg.com',
      },
    ],
  },
}

export default withNextIntl(nextConfig)