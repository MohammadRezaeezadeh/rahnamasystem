import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * روی محیط dev و روی هر دیپلویی که NEXT_PUBLIC_ALLOW_INDEXING=true نباشد،
 * کل سایت از ایندکس گوگل خارج می‌شود. این جلوی رایج‌ترین اشتباه سئو را می‌گیرد:
 * ایندکس‌شدن نسخه آزمایشی و ایجاد محتوای تکراری با سایت اصلی.
 */
export default function robots(): MetadataRoute.Robots {
  if (!site.allowIndexing) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
