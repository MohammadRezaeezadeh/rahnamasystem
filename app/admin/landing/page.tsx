import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { allPagesForAdmin } from "@/lib/landing";
import { formatDateFa } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function LandingIndexPage() {
  if (!(await currentUser())) redirect("/admin/login");

  const pages = await allPagesForAdmin();
  const industry = pages.filter((p) => p.kind === "industry");
  const comparison = pages.filter((p) => p.kind === "comparison");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">لندینگ‌پیج‌ها</h1>
          <p className="mt-1 text-sm text-ink-500">
            صفحات «صنف + منطقه» و مقایسه با رقبا — بدون کدنویسی
          </p>
        </div>
        <Link
          href="/admin/landing/new"
          className="min-h-10 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-800"
        >
          + صفحه جدید
        </Link>
      </div>

      <Group title="صنف و منطقه" pages={industry} prefix="" />
      <Group title="مقایسه با رقبا" pages={comparison} prefix="/compare" />
    </>
  );
}

function Group({
  title,
  pages,
  prefix,
}: {
  title: string;
  pages: Awaited<ReturnType<typeof allPagesForAdmin>>;
  prefix: string;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-extrabold text-ink-900">{title}</h2>

      {pages.length === 0 ? (
        <p className="mt-3 rounded-card border border-dashed border-ink-300 bg-white p-6 text-sm text-ink-500">
          هنوز صفحه‌ای ساخته نشده است.
        </p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {pages.map((page) => (
            <li
              key={page.slug}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-card border border-ink-200 bg-white px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-ink-900">{page.h1}</p>
                <p className="ltr mt-0.5 truncate font-mono text-[0.7rem] text-ink-500">
                  {prefix}/{page.slug}
                </p>
              </div>

              <span
                className={`rounded-md px-2 py-1 text-[0.7rem] font-bold ${
                  page.published ? "bg-brand-100 text-brand-800" : "bg-ink-100 text-ink-600"
                }`}
              >
                {page.published ? "منتشر شده" : "پیش‌نویس"}
              </span>

              <span className="text-[0.7rem] text-ink-400">{formatDateFa(page.updated_at)}</span>

              <div className="flex gap-2">
                {page.published && (
                  <Link
                    href={`${prefix}/${page.slug}`}
                    target="_blank"
                    className="min-h-9 rounded-lg border border-ink-200 px-3 py-2 text-xs font-bold text-ink-600 hover:border-brand-400 hover:text-brand-700"
                  >
                    مشاهده
                  </Link>
                )}
                <Link
                  href={`/admin/landing/${page.slug}`}
                  className="min-h-9 rounded-lg bg-ink-100 px-3 py-2 text-xs font-bold text-ink-800 hover:bg-ink-200"
                >
                  ویرایش
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
