import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  ...(process.env.HOSTINGER_BUILD === "1" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
