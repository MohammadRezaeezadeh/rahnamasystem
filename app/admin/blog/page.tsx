import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { allPostsForAdmin } from "@/lib/blog";
import { getCategory } from "@/lib/blog-content";
import { formatDateFa, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  if (!(await currentUser())) redirect("/admin/login");

  const posts = await allPostsForAdmin();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">مقالات</h1>
          <p className="mt-1 text-sm text-ink-500">
            انتشار مقاله جدید بدون دیپلوی — همان لحظه روی سایت می‌آید
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="min-h-10 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-800"
        >
          + مقاله جدید
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-8 rounded-card border border-dashed border-ink-300 bg-white p-6 text-sm text-ink-500">
          هنوز مقاله‌ای نوشته نشده است.
        </p>
      ) : (
        <ul className="mt-8 space-y-2.5">
          {posts.map((post) => {
            const category = getCategory(post.category);
            return (
              <li
                key={post.slug}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-card border border-ink-200 bg-white px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-ink-900">{post.title}</p>
                  <p className="ltr mt-0.5 truncate font-mono text-[0.7rem] text-ink-500">
                    /blog/{post.slug}
                  </p>
                </div>

                {category && (
                  <span className="rounded-md bg-ink-100 px-2 py-1 text-[0.7rem] text-ink-700">
                    {category.label}
                  </span>
                )}

                <span className="text-[0.7rem] text-ink-400">
                  {formatNumber(post.reading_minutes)} دقیقه
                </span>

                <span
                  className={`rounded-md px-2 py-1 text-[0.7rem] font-bold ${
                    post.published ? "bg-brand-100 text-brand-800" : "bg-ink-100 text-ink-600"
                  }`}
                >
                  {post.published ? "منتشر شده" : "پیش‌نویس"}
                </span>

                {post.published_at && (
                  <span className="text-[0.7rem] text-ink-400">
                    {formatDateFa(post.published_at)}
                  </span>
                )}

                <div className="flex gap-2">
                  {post.published && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="min-h-9 rounded-lg border border-ink-200 px-3 py-2 text-xs font-bold text-ink-600 hover:border-brand-400 hover:text-brand-700"
                    >
                      مشاهده
                    </Link>
                  )}
                  <Link
                    href={`/admin/blog/${post.slug}`}
                    className="min-h-9 rounded-lg bg-ink-100 px-3 py-2 text-xs font-bold text-ink-800 hover:bg-ink-200"
                  >
                    ویرایش
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
