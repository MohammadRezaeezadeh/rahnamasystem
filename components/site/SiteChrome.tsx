import { site, whatsappLink } from "@/lib/site";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { JsonLd } from "./JsonLd";
import { localBusinessSchema, webSiteSchema } from "@/lib/schema";
import { Analytics } from "./Analytics";
import { BehaviorTracker } from "./BehaviorTracker";
import { HelpPopup } from "./HelpPopup";

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
      <Analytics />
      <BehaviorTracker />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <HelpPopup
        whatsappHref={whatsappLink("سلام، چند سؤال درباره نرم‌افزار سپیدار داشتم.")}
        phoneLabel={site.contact.primary.label}
        phoneHref={site.contact.primary.href}
      />
    </>
  );
}
