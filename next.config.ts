import type { NextConfig } from "next";

const redirectTarget = process.env.REDIRECT_TARGET_URL?.trim().replace(
  /\/+$/,
  "",
);

const nextConfig: NextConfig = {
  async redirects() {
    if (!redirectTarget) {
      return [];
    }

    return [
      {
        source: "/:path*",
        destination: `${redirectTarget}/:path*`,
        permanent: true,
      },
    ];
  },

  async headers() {
    if (!redirectTarget) {
      return [];
    }

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
