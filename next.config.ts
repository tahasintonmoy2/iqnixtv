import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sea1.ingest.uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "63bkletksl.ucarecd.net",
      },
      {
        protocol: "https",
        hostname: "lwjih3w6vm.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "image.mux.com",
      },
    ],
  },
  reactStrictMode: false,
};

export default nextConfig;
