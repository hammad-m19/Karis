import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude puppeteer and better-sqlite3 from client bundles
  serverExternalPackages: ['puppeteer', 'better-sqlite3', 'pdf-parse'],
  
  // Allow longer API timeouts for scraping
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
