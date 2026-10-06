import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cloud-campus-s3.s3.ap-southeast-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
