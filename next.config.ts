import type { NextConfig } from "next";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

// Basic browser protections for every page. (No strict Content-Security-Policy:
// the Contact page embeds Google Maps and Next.js uses inline scripts.)
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Lets a second dev server (for tests) run beside the normal one.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // Photos uploaded from the admin panel are served from our Cloudinary folder.
    remotePatterns: cloudName
      ? [
          {
            protocol: "https",
            hostname: "res.cloudinary.com",
            pathname: `/${cloudName}/**`,
          },
        ]
      : [],
  },
};

export default nextConfig;
