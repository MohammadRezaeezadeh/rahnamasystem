import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { productsSorted } from "@/lib/products";
import { getPostForAdmin } from "@/lib/blog";
import { PostForm } from "../PostForm";
import { deletePostAction } from "../actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function EditPostPage({ params }: Props) {
  if (!(await currentUser())) redirect("/admin/login");

  const { slug } = await params;
  const isNew = slug === "new";

  const post = isNew ? null : await getPostForAdmin(slug);
  if (!isNew && !post) notFound();

  const products = productsSorted.map((p) => ({ slug: p.slug, label: p.shortName }));

  return (
    <>
      <Link href="/admin/blog" className="text-xs font-bold text-ink-500 hover:text-brand-700">
        → بازگشت به فهرست مقالات
      </Link>

      <h1 className="mt-3 text-xl font-extrabold text-ink-900">
        {isNew ? "مقاله جدید" : post!.title}
      </h1>

      <div className="mt-6">
        <PostForm post={post} products={products} />
      </div>

      {post && (
        <form action={deletePostAction} className="mt-8 border-t border-ink-200 pt-6">
          <input type="hidden" name="slug" value={post.slug} />
          <button
            type="submit"
            className="min-h-10 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-700 transition-colors hover:bg-red-50"
          >
            حذف این مقاله
          </button>
          <p className="mt-2 text-[0.7rem] text-ink-500">
            اگر مقاله در گوگل ایندکس شده، حذفش خطای ۴۰۴ می‌سازد. معمولاً بهتر است به‌جای حذف،
            تیک «منتشر شود» را بردارید.
          </p>
        </form>
      )}
    </>
  );
}
