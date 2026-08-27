import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { productsSorted } from "@/lib/products";

/**
 * نقشه سایت خودکار.
 *
 * صفحات محصول از lib/products.ts ساخته می‌شوند، پس افزودن محصول جدید
 * خودبه‌خود در sitemap ظاهر می‌شود.
 * در فاز ۳ لندینگ‌های صنفی و در فاز ۴ مقالات از دیتابیس به همین لیست اضافه می‌شوند.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/consultation`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const productPages: MetadataRoute.Sitemap = productsSorted.map((product) => ({
    url: `${site.url}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticPages, ...productPages];
}
