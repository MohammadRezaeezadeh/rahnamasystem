"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { productSlugs } from "@/lib/products";
import {
  savePage,
  deletePage,
  getPageForAdmin,
  isValidSlug,
  parseSections,
  parseFaqs,
  parseComparison,
  RESERVED_SLUGS,
  type LandingKind,
} from "@/lib/landing";

export type LandingFormState = { error?: string; success?: string };

function readKind(value: string): LandingKind {
  return value === "comparison" ? "comparison" : "industry";
}

export async function saveLandingAction(
  _prev: LandingFormState,
  formData: FormData,
): Promise<LandingFormState> {
  if (!(await currentUser())) return { error: "نشست شما منقضی شده. دوباره وارد شوید." };

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (!slug) return { error: "آدرس صفحه (اسلاگ) را وارد کنید." };
  if (RESERVED_SLUGS.has(slug)) {
    return { error: `«${slug}» یک مسیر ثابت سایت است و نمی‌تواند اسلاگ صفحه باشد.` };
  }
  if (!isValidSlug(slug)) {
    return {
      error: "اسلاگ فقط حروف کوچک انگلیسی، عدد و خط تیره — مثل hesabdari-tolidi-mashhad",
    };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const h1 = String(formData.get("h1") ?? "").trim();

  if (!title) return { error: "عنوان صفحه (تگ title) لازم است." };
  if (!description) return { error: "توضیح متا لازم است — همان چیزی که در گوگل زیر عنوان می‌آید." };
  if (!h1) return { error: "تیتر اصلی صفحه (h1) لازم است." };

  // گوگل توضیح متا را حدود ۱۶۰ کاراکتر برش می‌زند
  if (description.length > 300) {
    return { error: "توضیح متا خیلی بلند است. حدود ۱۵۰ تا ۱۶۰ کاراکتر ایده‌آل است." };
  }

  const kind = readKind(String(formData.get("kind") ?? ""));
  const competitor = String(formData.get("competitor") ?? "").trim() || null;

  if (kind === "comparison" && !competitor) {
    return { error: "برای صفحه مقایسه، نام نرم‌افزار رقیب لازم است." };
  }

  // فقط اسلاگ‌های واقعی محصول پذیرفته می‌شوند تا لینک شکسته ساخته نشود
  const known = new Set(productSlugs());
  const relatedProducts = String(formData.get("related_products") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => known.has(s));

  try {
    await savePage({
      slug,
      kind,
      title,
      description,
      h1,
      intro: String(formData.get("intro") ?? "").trim() || null,
      sections: parseSections(String(formData.get("sections") ?? "")),
      faqs: parseFaqs(String(formData.get("faqs") ?? "")),
      industry: String(formData.get("industry") ?? "").trim() || null,
      area: String(formData.get("area") ?? "").trim() || null,
      competitor,
      comparison_rows: parseComparison(String(formData.get("comparison_rows") ?? "")),
      related_products: relatedProducts,
      published: formData.get("published") === "on",
    });
  } catch (error) {
    console.error("savePage failed:", error);
    return { error: "ذخیره ناموفق بود. اتصال دیتابیس را بررسی کنید." };
  }

  revalidatePath("/admin/landing");

  const published = formData.get("published") === "on";
  const url = kind === "comparison" ? `/compare/${slug}` : `/${slug}`;
  return {
    success: published ? `ذخیره و منتشر شد — ${url}` : "به‌عنوان پیش‌نویس ذخیره شد.",
  };
}

export async function deleteLandingAction(formData: FormData): Promise<void> {
  if (!(await currentUser())) return;

  const slug = String(formData.get("slug") ?? "");
  const page = await getPageForAdmin(slug);
  if (!page) return;

  await deletePage(slug, page.kind);
  revalidatePath("/admin/landing");
  redirect("/admin/landing");
}
