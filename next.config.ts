import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/api/export/[id]": [
      "./node_modules/puppeteer-core/**/*",
      "./node_modules/@sparticuz/chromium/**/*",
    ],
    "/api/export/[id]/route": [
      "./node_modules/puppeteer-core/**/*",
      "./node_modules/@sparticuz/chromium/**/*",
    ],
  },
};

export default nextConfig;
