import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { productsSorted } from "@/lib/products";
import {
  getPageForAdmin,
  sectionsToText,
  faqsToText,
  comparisonToText,
} from "@/lib/landing";
import { LandingForm } from "../LandingForm";
import { deleteLandingAction } from "../actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function EditLandingPage({ params }: Props) {
  if (!(await currentUser())) redirect("/admin/login");

  const { slug } = await params;
  const isNew = slug === "new";

  const page = isNew ? null : await getPageForAdmin(slug);
  if (!isNew && !page) notFound();

  const products = productsSorted.map((p) => ({ slug: p.slug, label: p.shortName }));

  return (
    <>
      <Link href="/admin/landing" className="text-xs font-bold text-ink-500 hover:text-brand-700">
        → بازگشت به فهرست
      </Link>

      <h1 className="mt-3 text-xl font-extrabold text-ink-900">
        {isNew ? "صفحه جدید" : page!.h1}
      </h1>

      <div className="mt-6">
        <LandingForm
          page={page}
          products={products}
          initialSections={page ? sectionsToText(page.sections) : ""}
          initialFaqs={page ? faqsToText(page.faqs) : ""}
          initialComparison={page ? comparisonToText(page.comparison_rows) : ""}
        />
      </div>

      {page && (
        <form action={deleteLandingAction} className="mt-8 border-t border-ink-200 pt-6">
          <input type="hidden" name="slug" value={page.slug} />
          <button
            type="submit"
            className="min-h-10 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-700 transition-colors hover:bg-red-50"
          >
            حذف این صفحه
          </button>
          <p className="mt-2 text-[0.7rem] text-ink-500">
            اگر این صفحه در گوگل ایندکس شده، حذفش باعث خطای ۴۰۴ می‌شود. معمولاً بهتر است
            به‌جای حذف، تیک «منتشر شود» را بردارید.
          </p>
        </form>
      )}
    </>
  );
}
