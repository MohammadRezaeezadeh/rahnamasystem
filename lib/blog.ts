import "server-only";
import { unstable_cache, updateTag, revalidatePath } from "next/cache";
import { query, queryOne, isDatabaseConfigured } from "./db";
import { BLOG_TAG, type Post } from "./blog-content";

export * from "./blog-content";

/** فقط مقالات منتشرشده — همین در سایت عمومی و sitemap استفاده می‌شود */
const loadPublished = unstable_cache(
  async (): Promise<Post[]> => {
    if (!isDatabaseConfigured()) return [];
    try {
      return await query<Post>(
        `select * from posts
          where published = true and published_at is not null and published_at <= now()
          order by published_at desc`,
      );
    } catch (error) {
      // وبلاگ نباید کل سایت را بیندازد
      console.error("خواندن مقالات ناموفق بود:", error);
      return [];
    }
  },
  ["blog-published"],
  { tags: [BLOG_TAG] },
);

export async function publishedPosts(category?: string): Promise<Post[]> {
  const all = await loadPublished();
  return category ? all.filter((p) => p.category === category) : all;
}

export async function getPublishedPost(slug: string): Promise<Post | null> {
  const all = await loadPublished();
  return all.find((p) => p.slug === slug) ?? null;
}

/** مقالات مرتبط: هم‌دسته، به‌جز خود مقاله */
export async function relatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const all = await loadPublished();
  const sameCategory = all.filter((p) => p.slug !== post.slug && p.category === post.category);
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const others = all.filter((p) => p.slug !== post.slug && p.category !== post.category);
  return [...sameCategory, ...others].slice(0, limit);
}

/** تعداد مقاله در هر دسته — برای فهرست دسته‌ها */
export async function countByCategory(): Promise<Record<string, number>> {
  const all = await loadPublished();
  const counts: Record<string, number> = {};
  for (const post of all) counts[post.category] = (counts[post.category] ?? 0) + 1;
  return counts;
}

// ---------------------------------------------------------------- پنل

export async function allPostsForAdmin(): Promise<Post[]> {
  return query<Post>("select * from posts order by coalesce(published_at, created_at) desc");
}

export async function getPostForAdmin(slug: string): Promise<Post | null> {
  return queryOne<Post>("select * from posts where slug = $1", [slug]);
}

export type PostInput = Omit<Post, "updated_at" | "reading_minutes"> & {
  reading_minutes: number;
};

export async function savePost(input: PostInput): Promise<void> {
  await query(
    `insert into posts
       (slug, title, description, excerpt, category, body,
        related_products, reading_minutes, published, published_at, updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())
     on conflict (slug) do update set
       title = excluded.title,
       description = excluded.description,
       excerpt = excluded.excerpt,
       category = excluded.category,
       body = excluded.body,
       related_products = excluded.related_products,
       reading_minutes = excluded.reading_minutes,
       published = excluded.published,
       published_at = excluded.published_at,
       updated_at = now()`,
    [
      input.slug,
      input.title,
      input.description,
      input.excerpt,
      input.category,
      input.body,
      input.related_products,
      input.reading_minutes,
      input.published,
      input.published_at,
    ],
  );
  invalidate(input.slug, input.category);
}

export async function deletePost(slug: string, category: string): Promise<void> {
  await query("delete from posts where slug = $1", [slug]);
  invalidate(slug, category);
}

/** انتشار باید همان لحظه روی سایت بنشیند — بدون دیپلوی مجدد */
function invalidate(slug: string, category: string) {
  updateTag(BLOG_TAG);
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath(`/blog/category/${category}`);
  revalidatePath("/sitemap.xml");
}
