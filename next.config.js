/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/@:username",
        destination: "/:username",
      },
      {
        source: "/@:username/:path*",
        destination: "/:username/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
