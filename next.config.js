/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.ts$/,
      include: /supabase\/functions/,
      use: 'ignore-loader',
    });
    return config;
  },
};

module.exports = nextConfig;