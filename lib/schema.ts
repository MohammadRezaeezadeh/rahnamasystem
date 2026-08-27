/**
 * سازنده‌های داده ساختاریافته schema.org
 *
 * هر صفحه فقط تابع مناسب خودش را صدا می‌زند و خروجی را داخل
 * <JsonLd data={...} /> می‌گذارد. مقادیر مشترک از lib/site.ts می‌آید تا
 * تغییر آدرس یا تلفن، همه‌ی صفحات را هم‌زمان به‌روز کند.
 */
import { site } from "./site";
import type { Product } from "./products";

const ORG_ID = `${site.url}/#organization`;

/** LocalBusiness — روی همه صفحات لود می‌شود (فاز ۳ سئوی محلی) */
export function localBusinessSchema() {
  const allPhones = [site.contact.primary, site.contact.office, ...site.contact.mobiles];

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": ORG_ID,
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: site.url,
    telephone: site.contact.primary.href.replace("tel:", ""),
    email: site.contact.email,
    /** بقیه خطوط - گوگل فقط یک telephone می‌پذیرد، مابقی به‌صورت contactPoint */
    contactPoint: allPhones.map((phone) => ({
      "@type": "ContactPoint",
      telephone: phone.href.replace("tel:", ""),
      contactType: "sales",
      areaServed: "IR",
      availableLanguage: "fa",
    })),
    employee: {
      "@type": "Person",
      name: site.representative.name,
      jobTitle: site.representative.role,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.province,
      postalCode: site.address.postalCode || undefined,
      addressCountry: site.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.address.geo.lat,
      longitude: site.address.geo.lng,
    },
    openingHoursSpecification: site.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: [
      { "@type": "City", name: "مشهد" },
      { "@type": "AdministrativeArea", name: "خراسان رضوی" },
    ],
    knowsAbout: [
      "نرم‌افزار حسابداری سپیدار",
      "نرم‌افزار دشت همکاران سیستم",
      "سامانه مودیان",
      "پیاده‌سازی نرم‌افزار حسابداری",
    ],
  };
}

/** WebSite — به گوگل می‌گوید نام سایت چیست */
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: site.url,
    inLanguage: "fa-IR",
    publisher: { "@id": ORG_ID },
  };
}

/**
 * Product — صفحه هر بسته سپیدار.
 * قیمت اختیاری است: در فاز ۰ قیمتی نداریم، در فاز ۱ از پنل مدیریت می‌آید.
 */
export function productSchema(product: Product, priceToman?: number) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    url: `${site.url}/products/${product.slug}`,
    category: "نرم‌افزار حسابداری",
    brand: { "@type": "Brand", name: "سپیدار سیستم" },
    offers: {
      "@type": "Offer",
      url: `${site.url}/products/${product.slug}`,
      /** گوگل مبلغ را به ریال می‌خواهد؛ سایت به تومان نمایش می‌دهد */
      priceCurrency: "IRR",
      ...(priceToman ? { price: priceToman * 10 } : {}),
      availability: "https://schema.org/InStock",
      seller: { "@id": ORG_ID },
    },
  };
}

/** FAQPage — بخش سؤالات متداول صفحات محصول و لندینگ‌های صنفی */
export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** BreadcrumbList — مسیر صفحه در نتایج گوگل */
export function breadcrumbSchema(trail: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.href}`,
    })),
  };
}

/**
 * BlogPosting — صفحه هر مقاله.
 * ناشر همان کسب‌وکار است، پس به ORG_ID ارجاع می‌دهیم تا گوگل مقاله را
 * به همان LocalBusiness وصل کند.
 */
export function articleSchema(post: {
  slug: string;
  title: string;
  description: string;
  published_at: string | null;
  updated_at: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    inLanguage: "fa-IR",
    mainEntityOfPage: { "@type": "WebPage", "@id": `${site.url}/blog/${post.slug}` },
    url: `${site.url}/blog/${post.slug}`,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}
