import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // TikTok CDN hosts for thumbnails imported via scripts/import-apify.ts
      { protocol: "https", hostname: "*.tiktokcdn-us.com" },
      { protocol: "https", hostname: "*.tiktokcdn-eu.com" },
      { protocol: "https", hostname: "*.tiktokcdn.com" },
    ],
  },
};

export default nextConfig;
