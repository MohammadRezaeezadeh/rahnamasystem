/**
 * انواع داده و تبدیل متن ← ساختار برای لندینگ‌پیج‌ها.
 *
 * این فایل عمداً "server-only" نیست: توابع خالص‌اند و هم Server Action و
 * هم کامپوننت کلاینت (برای پیش‌نمایش زنده) می‌توانند از آن‌ها استفاده کنند.
 */

export const LANDING_TAG = "landing-pages";

export type LandingKind = "industry" | "comparison";

export type Section = { heading: string; body: string };
export type Faq = { question: string; answer: string };
export type ComparisonRow = { feature: string; ours: string; theirs: string };

export type LandingPage = {
  slug: string;
  kind: LandingKind;
  title: string;
  description: string;
  h1: string;
  intro: string | null;
  sections: Section[];
  faqs: Faq[];
  industry: string | null;
  area: string | null;
  competitor: string | null;
  comparison_rows: ComparisonRow[];
  related_products: string[];
  published: boolean;
  updated_at: string;
};

/** اسلاگ‌هایی که مسیر واقعی سایت‌اند و نباید به لندینگ داده شوند */
export const RESERVED_SLUGS = new Set([
  "products",
  "blog",
  "contact",
  "consultation",
  "checkout",
  "admin",
  "compare",
  "api",
  "sitemap.xml",
  "robots.txt",
  "icon.svg",
  "_next",
]);

/** اسلاگ باید انگلیسی، کوچک و با خط تیره باشد */
export function isValidSlug(slug: string): boolean {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;
  if (slug.length < 3 || slug.length > 80) return false;
  return !RESERVED_SLUGS.has(slug);
}

// ---------------------------------------------------------------- تبدیل متن

/**
 * شکستن متن به خط، با یکسان‌سازی پایان خط.
 *
 * ⚠️ این تابع یک باگ واقعی را رفع می‌کند، نه یک احتیاط تئوری:
 * مرورگر هنگام ارسال فرم، پایان خط textarea را طبق استاندارد HTML به
 * CRLF تبدیل می‌کند. اگر کاراکتر بازگشت کالسکه باقی بماند، در الگوی
 * عنوان بخش‌ها نقطه آن را در بر نمی‌گیرد و علامت پایان الگو بعد از آن
 * نمی‌نشیند — نتیجه‌اش این بود که همه بخش‌های متن بی‌صدا دور ریخته
 * می‌شدند و مدیر سایت متوجه نمی‌شد چرا صفحه خالی است.
 */
function splitLines(raw: string): string[] {
  return raw.replace(/\r\n?/g, "\n").split("\n");
}

/**
 * بخش‌ها از یک textarea خوانده می‌شوند: هر خطی که با «### » شروع شود
 * یک عنوان جدید است و خطوط بعدی متن آن بخش‌اند.
 */
export function parseSections(raw: string): Section[] {
  const out: Section[] = [];
  let current: Section | null = null;

  for (const line of splitLines(raw)) {
    const heading = line.match(/^###\s+(.*)$/);
    if (heading) {
      if (current) out.push(current);
      current = { heading: heading[1].trim(), body: "" };
    } else if (current) {
      current.body += (current.body ? "\n" : "") + line;
    }
  }
  if (current) out.push(current);

  return out
    .map((s) => ({ heading: s.heading, body: s.body.trim() }))
    .filter((s) => s.heading && s.body);
}

export function sectionsToText(sections: Section[]): string {
  return sections.map((s) => `### ${s.heading}\n${s.body}`).join("\n\n");
}

/** هر خط: «سؤال | جواب» */
export function parseFaqs(raw: string): Faq[] {
  return splitLines(raw)
    .map((line) => line.split("|").map((p) => p.trim()))
    .filter((parts) => parts.length >= 2 && parts[0] && parts[1])
    .map((parts) => ({ question: parts[0], answer: parts.slice(1).join(" | ") }));
}

export function faqsToText(faqs: Faq[]): string {
  return faqs.map((f) => `${f.question} | ${f.answer}`).join("\n");
}

/** هر خط: «ویژگی | سپیدار | رقیب» */
export function parseComparison(raw: string): ComparisonRow[] {
  return splitLines(raw)
    .map((line) => line.split("|").map((p) => p.trim()))
    .filter((parts) => parts.length >= 3 && parts[0])
    .map((parts) => ({ feature: parts[0], ours: parts[1], theirs: parts[2] }));
}

export function comparisonToText(rows: ComparisonRow[]): string {
  return rows.map((r) => `${r.feature} | ${r.ours} | ${r.theirs}`).join("\n");
}

