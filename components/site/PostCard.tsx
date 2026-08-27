import Link from "next/link";
import { getCategory, type Post } from "@/lib/blog-content";
import { formatDateFa, formatNumber } from "@/lib/format";

export function PostCard({ post, showCategory = true }: { post: Post; showCategory?: boolean }) {
  const category = getCategory(post.category);

  return (
    <article className="group flex flex-col rounded-card border border-ink-200 bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift">
      {showCategory && category && (
        <Link
          href={`/blog/category/${category.slug}`}
          className="w-fit rounded-lg bg-brand-50 px-2.5 py-1 text-[0.7rem] font-bold text-brand-700 hover:bg-brand-100"
        >
          {category.label}
        </Link>
      )}

      <h3 className="mt-4 text-base font-extrabold leading-relaxed text-ink-900 transition-colors group-hover:text-brand-700">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>

      <p className="mt-2.5 flex-1 text-sm leading-loose text-ink-600">{post.excerpt}</p>

      <div className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4 text-[0.7rem] text-ink-500">
        {post.published_at && (
          <time dateTime={post.published_at}>{formatDateFa(post.published_at)}</time>
        )}
        <span aria-hidden>·</span>
        <span>{formatNumber(post.reading_minutes)} دقیقه مطالعه</span>
      </div>
    </article>
  );
}
