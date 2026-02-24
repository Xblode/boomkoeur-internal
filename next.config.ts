import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/shotgun/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/uc',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  webpack: (config) => {
    const projectRoot = path.resolve(__dirname);
    config.resolve.modules = [
      path.join(projectRoot, "node_modules"),
      "node_modules",
    ];
    config.resolve.alias = {
      ...config.resolve.alias,
      tailwindcss: path.join(projectRoot, "node_modules/tailwindcss"),
    };
    return config;
  },
};

export default nextConfig;
