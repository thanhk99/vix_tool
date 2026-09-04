import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/director",
        destination: "/bgd",
        permanent: false,
      },
      {
        source: "/director/:path*",
        destination: "/bgd/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
