import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { productsSorted } from "@/lib/products";
import { publishedPages } from "@/lib/landing";

/**
 * نقشه سایت خودکار.
 *
 * سه منبع دارد و هیچ‌کدام دستی نیستند:
 *   ۱. صفحات ثابت
 *   ۲. صفحات محصول از lib/products.ts
 *   ۳. لندینگ‌پیج‌ها و صفحات مقایسه از دیتابیس
 * انتشار یک لندینگ از پنل، همان لحظه آن را وارد sitemap می‌کند.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/consultation`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const productPages: MetadataRoute.Sitemap = productsSorted.map((product) => ({
    url: `${site.url}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // اگر دیتابیس در دسترس نباشد، publishedPages آرایه خالی می‌دهد و
  // sitemap همچنان با صفحات ثابت ساخته می‌شود.
  const landing = await publishedPages();
  const landingPages: MetadataRoute.Sitemap = landing.map((page) => ({
    url:
      page.kind === "comparison"
        ? `${site.url}/compare/${page.slug}`
        : `${site.url}/${page.slug}`,
    lastModified: new Date(page.updated_at),
    changeFrequency: "monthly",
    // لندینگ صنفی هدف اصلی سئوی محلی است و اولویت بالایی می‌گیرد
    priority: page.kind === "industry" ? 0.8 : 0.7,
  }));

  return [...staticPages, ...productPages, ...landingPages];
}
