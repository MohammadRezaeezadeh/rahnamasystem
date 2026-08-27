import { Header } from "./Header";
import { Footer } from "./Footer";
import { JsonLd } from "./JsonLd";
import { localBusinessSchema, webSiteSchema } from "@/lib/schema";

/**
 * پوسته‌ی سایت عمومی: هدر، فوتر و داده ساختاریافته سراسری.
 *
 * جدا از layout ریشه است چون پنل مدیریت (/admin) نباید هیچ‌کدام از این‌ها را
 * داشته باشد — نه منوی فروش، نه دکمه «مشاوره رایگان»، نه schema کسب‌وکار.
 * صفحه ۴۰۴ هم از همین استفاده می‌کند تا کاربر گمشده منو داشته باشد.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        پرش به محتوای اصلی
      </a>
      <JsonLd data={[localBusinessSchema(), webSiteSchema()]} />
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
