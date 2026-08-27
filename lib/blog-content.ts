/**
 * دسته‌بندی‌ها، انواع داده و تبدیل متن مقاله.
 *
 * مثل lib/landing-content.ts عمداً "server-only" نیست: توابع خالص‌اند و
 * قابل تست مستقیم‌اند.
 */

export const BLOG_TAG = "blog-posts";

/**
 * دسته‌بندی‌ها در کد تعریف می‌شوند نه دیتابیس.
 * تعدادشان کم و ثابت است و این‌طوری هم تایپ امن می‌ماند هم یک صفحه
 * مدیریت اضافه لازم ندارد. افزودن دسته جدید = یک شیء در این آرایه.
 */
export const CATEGORIES = [
  {
    slug: "moadian",
    label: "سامانه مودیان و مالیات",
    description: "تکالیف قانونی، ارسال صورتحساب الکترونیکی و جریمه‌ها، به زبان ساده.",
  },
  {
    slug: "choosing",
    label: "راهنمای انتخاب بسته",
    description: "کدام نسخه سپیدار برای کدام کسب‌وکار، با مقایسه واقعی.",
  },
  {
    slug: "howto",
    label: "آموزش عملیاتی",
    description: "کار با سپیدار قدم‌به‌قدم: از ثبت فاکتور تا بستن سال مالی.",
  },
  {
    slug: "mashhad",
    label: "کسب‌وکار در مشهد",
    description: "نکات مالی و اداری مخصوص کسب‌وکارهای خراسان رضوی.",
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export type Post = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  body: string;
  related_products: string[];
  reading_minutes: number;
  published: boolean;
  published_at: string | null;
  updated_at: string;
};

/** «category» مسیر واقعی زیر /blog است و نباید اسلاگ مقاله شود */
export const RESERVED_POST_SLUGS = new Set(["category", "page", "feed", "rss"]);

export function isValidPostSlug(slug: string): boolean {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;
  if (slug.length < 3 || slug.length > 90) return false;
  return !RESERVED_POST_SLUGS.has(slug);
}

// ---------------------------------------------------------------- متن مقاله

/**
 * یکسان‌سازی پایان خط.
 * مرورگر متن textarea را با CRLF می‌فرستد؛ بدون این، الگوهایی که به
 * انتهای خط تکیه دارند بی‌صدا شکست می‌خورند. (همان باگ فاز ۳)
 */
function splitLines(raw: string): string[] {
  return raw.replace(/\r\n?/g, "\n").split("\n");
}

export type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string };

/**
 * تبدیل متن مقاله به بلوک‌های ساختاریافته.
 *
 * قالب عمداً همان قالب لندینگ‌هاست تا مدیر سایت یک چیز یاد بگیرد:
 *   ### عنوان        → تیتر بخش (h2)
 *   - مورد           → فهرست نقطه‌ای
 *   > نقل قول        → کادر تأکید
 *   بقیه خطوط        → پاراگراف (خط خالی پاراگراف را می‌بندد)
 */
export function parseArticle(raw: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ type: "list", items: list });
      list = [];
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (const line of splitLines(raw)) {
    const text = line.trim();

    if (!text) {
      flushAll();
      continue;
    }

    const heading = text.match(/^###\s+(.*)$/);
    if (heading) {
      flushAll();
      blocks.push({ type: "heading", text: heading[1].trim() });
      continue;
    }

    const bullet = text.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1].trim());
      continue;
    }

    const quote = text.match(/^>\s+(.*)$/);
    if (quote) {
      flushAll();
      blocks.push({ type: "quote", text: quote[1].trim() });
      continue;
    }

    flushList();
    paragraph.push(text);
  }

  flushAll();
  return blocks;
}

/**
 * تکه‌های یک پاراگراف: متن ساده و لینک داخلی به محصول.
 *
 * نویسنده در متن می‌نویسد [[manufacturing|نسخه تولیدی]] و اینجا به لینک
 * تبدیل می‌شود. لینک داخلی داخل متن، از نظر سئو خیلی ارزشمندتر از یک
 * کارت در پایان صفحه است.
 */
export type Piece = { type: "text"; text: string } | { type: "link"; slug: string; text: string };

export function parseInline(text: string): Piece[] {
  const pieces: Piece[] = [];
  const pattern = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      pieces.push({ type: "text", text: text.slice(last, match.index) });
    }
    pieces.push({ type: "link", slug: match[1], text: (match[2] ?? match[1]).trim() });
    last = match.index + match[0].length;
  }

  if (last < text.length) pieces.push({ type: "text", text: text.slice(last) });
  return pieces;
}

/** اسلاگ محصولاتی که در متن مقاله لینک داخلی گرفته‌اند */
export function inlineProductSlugs(raw: string): string[] {
  const found = new Set<string>();
  for (const m of raw.matchAll(/\[\[([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g)) found.add(m[1]);
  return [...found];
}

/** دقیقه مطالعه — حدود ۲۰۰ کلمه در دقیقه برای متن فارسی */
export function readingMinutes(raw: string): number {
  const words = raw.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
