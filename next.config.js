/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vite kept `build` and `lint` as separate concerns (vite build never ran
  // ESLint). Keep that separation here too — `npm run lint` still surfaces
  // pre-existing violations (this codebase's old eslint.config.js had a glob
  // bug that never linted .ts/.tsx files, so real issues are only now
  // visible), but they're pre-existing debt outside this epic's task scope
  // and shouldn't block `npm run build`.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4000" },
      { protocol: "https", hostname: "media.istockphoto.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

module.exports = nextConfig;
