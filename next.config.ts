import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // خروجی standalone: Next یک server.js می‌سازد کنار یک node_modules
  // حداقلی (۲۸ مگابایت به‌جای ۴۳۱ مگابایت).
  //
  // build روی ماشین خودمان انجام می‌شود و فقط همین خروجی آماده به لیارا
  // می‌رود. دلیلش پلن است: ۵۱۲ مگابایت رم برای اینکه npm بخواهد آنجا
  // ۴۳۱ مگابایت node_modules را استخراج کند کافی نیست و پروسه با
  // «Exit handler never called!» کشته می‌شود.
  //
  // اجرا با `node server.js` است نه `next start` — به همین دلیل تعارضی
  // که قبلاً جلوی standalone را گرفته بود دیگر موضوعیت ندارد.
  output: "standalone",
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
