/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'indo-api.kohai.gg',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
