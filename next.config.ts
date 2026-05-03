import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Keep a minimal turbopack config to avoid Next.js error when using a custom webpack key.
  turbopack: {},

  webpack: (config, { isServer }) => {
    // Ensure .html files in some node modules don't break the Next.js bundler.
    // Treat .html imports as source strings so they won't be treated as unknown module types.
    config.module ??= { rules: [] } as any;
    config.module.rules.push({
      test: /\.html$/i,
      type: 'asset/source',
      exclude: /node_modules\\.*node-pre-gyp/,
    });

    return config;
  },
};

export default nextConfig;
