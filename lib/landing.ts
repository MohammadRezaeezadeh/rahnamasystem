import "server-only";
import { unstable_cache, updateTag, revalidatePath } from "next/cache";
import { query, queryOne, isDatabaseConfigured } from "./db";
import { LANDING_TAG, type LandingKind, type LandingPage, type Section, type Faq, type ComparisonRow } from "./landing-content";

// دوباره صادر می‌شوند تا جای مصرف لازم نباشد بداند کدام فایل
export * from "./landing-content";

/**
 * لندینگ‌پیج‌های صنفی و صفحات مقایسه.
 *
 * هدف اصلی این فایل: افزودن صفحه جدید نباید کدنویسی بخواهد. محتوا در
 * دیتابیس است و از پنل مدیریت پر می‌شود؛ قالب رندر مشترک است.
 *
 * بلوک‌های تکرارشونده (بخش‌ها، سؤالات، ردیف‌های مقایسه) در پنل به‌صورت
 * متن ساده وارد می‌شوند و همین‌جا به ساختار تبدیل می‌شوند — تا مدیر سایت
 * لازم نباشد JSON بنویسد.
 */

// ---------------------------------------------------------------- خواندن

type Row = Omit<LandingPage, "sections" | "faqs" | "comparison_rows"> & {
  sections: unknown;
  faqs: unknown;
  comparison_rows: unknown;
};

function toPage(row: Row): LandingPage {
  return {
    ...row,
    sections: Array.isArray(row.sections) ? (row.sections as Section[]) : [],
    faqs: Array.isArray(row.faqs) ? (row.faqs as Faq[]) : [],
    comparison_rows: Array.isArray(row.comparison_rows)
      ? (row.comparison_rows as ComparisonRow[])
      : [],
  };
}

/** فقط صفحات منتشرشده — همین در سایت عمومی و sitemap استفاده می‌شود */
const loadPublished = unstable_cache(
  async (): Promise<LandingPage[]> => {
    if (!isDatabaseConfigured()) return [];
    try {
      const rows = await query<Row>(
        "select * from landing_pages where published = true order by updated_at desc",
      );
      return rows.map(toPage);
    } catch (error) {
      // سایت نباید به‌خاطر دیتابیس بیفتد
      console.error("خواندن لندینگ‌پیج‌ها ناموفق بود:", error);
      return [];
    }
  },
  ["landing-published"],
  { tags: [LANDING_TAG] },
);

export async function publishedPages(kind?: LandingKind): Promise<LandingPage[]> {
  const all = await loadPublished();
  return kind ? all.filter((p) => p.kind === kind) : all;
}

export async function getPublishedPage(
  slug: string,
  kind: LandingKind,
): Promise<LandingPage | null> {
  const all = await loadPublished();
  return all.find((p) => p.slug === slug && p.kind === kind) ?? null;
}

/** همه صفحات، از جمله پیش‌نویس‌ها — فقط برای پنل مدیریت */
export async function allPagesForAdmin(): Promise<LandingPage[]> {
  const rows = await query<Row>("select * from landing_pages order by kind, updated_at desc");
  return rows.map(toPage);
}

export async function getPageForAdmin(slug: string): Promise<LandingPage | null> {
  const row = await queryOne<Row>("select * from landing_pages where slug = $1", [slug]);
  return row ? toPage(row) : null;
}

// ---------------------------------------------------------------- نوشتن

export type LandingInput = Omit<LandingPage, "updated_at">;

export async function savePage(input: LandingInput): Promise<void> {
  await query(
    `insert into landing_pages
       (slug, kind, title, description, h1, intro, sections, faqs,
        industry, area, competitor, comparison_rows, related_products, published, updated_at)
     values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10,$11,$12::jsonb,$13,$14, now())
     on conflict (slug) do update set
       kind = excluded.kind,
       title = excluded.title,
       description = excluded.description,
       h1 = excluded.h1,
       intro = excluded.intro,
       sections = excluded.sections,
       faqs = excluded.faqs,
       industry = excluded.industry,
       area = excluded.area,
       competitor = excluded.competitor,
       comparison_rows = excluded.comparison_rows,
       related_products = excluded.related_products,
       published = excluded.published,
       updated_at = now()`,
    [
      input.slug,
      input.kind,
      input.title,
      input.description,
      input.h1,
      input.intro,
      JSON.stringify(input.sections),
      JSON.stringify(input.faqs),
      input.industry,
      input.area,
      input.competitor,
      JSON.stringify(input.comparison_rows),
      input.related_products,
      input.published,
    ],
  );
  invalidate(input.kind, input.slug);
}

export async function deletePage(slug: string, kind: LandingKind): Promise<void> {
  await query("delete from landing_pages where slug = $1", [slug]);
  invalidate(kind, slug);
}

/** انتشار باید بلافاصله روی سایت بنشیند — بدون دیپلوی مجدد */
function invalidate(kind: LandingKind, slug: string) {
  updateTag(LANDING_TAG);
  revalidatePath(kind === "comparison" ? `/compare/${slug}` : `/${slug}`);
  revalidatePath("/sitemap.xml");
}
