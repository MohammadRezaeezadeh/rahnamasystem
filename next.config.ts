import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // عمداً output: "standalone" نداریم.
  // اسکریپت start ما next start است و Next هشدار می‌دهد که این دو با هم
  // کار نمی‌کنند؛ پوشه standalone فقط حجم build را زیاد می‌کرد.
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
