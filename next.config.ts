import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  // Use basePath for GitHub Pages deployed to a subfolder
  basePath: isProd ? '/blogtalk' : '',
  // Force trailing slashes for GitHub Pages dynamic routes
  trailingSlash: true,
  // Disable server-based image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
