"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { productSlugs } from "@/lib/products";
import { savePost, deletePost, getPostForAdmin } from "@/lib/blog";
import {
  getCategory,
  isValidPostSlug,
  readingMinutes,
  inlineProductSlugs,
  parseArticle,
  RESERVED_POST_SLUGS,
} from "@/lib/blog-content";

export type PostFormState = { error?: string; success?: string };

export async function savePostAction(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  if (!(await currentUser())) return { error: "نشست شما منقضی شده. دوباره وارد شوید." };

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (!slug) return { error: "آدرس مقاله (اسلاگ) را وارد کنید." };
  if (RESERVED_POST_SLUGS.has(slug)) {
    return { error: `«${slug}» یک مسیر ثابت زیر /blog است و نمی‌تواند اسلاگ مقاله باشد.` };
  }
  if (!isValidPostSlug(slug)) {
    return { error: "اسلاگ فقط حروف کوچک انگلیسی، عدد و خط تیره — مثل samane-moadian-rahnama" };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (!title) return { error: "عنوان مقاله لازم است." };
  if (!description) return { error: "توضیح متا لازم است — همان چیزی که در گوگل زیر عنوان می‌آید." };
  if (description.length > 300) {
    return { error: "توضیح متا خیلی بلند است. حدود ۱۵۰ تا ۱۶۰ کاراکتر ایده‌آل است." };
  }
  if (!excerpt) return { error: "خلاصه مقاله لازم است — در کارت فهرست وبلاگ نمایش داده می‌شود." };
  if (!body) return { error: "متن مقاله خالی است." };
  if (!getCategory(category)) return { error: "دسته‌بندی را انتخاب کنید." };

  // متن باید واقعاً به بلوک تبدیل شود؛ اگر پارسر چیزی درنیاورد یعنی
  // قالب اشتباه است و مقاله خالی منتشر می‌شود.
  if (parseArticle(body).length === 0) {
    return { error: "متن مقاله قابل خواندن نیست. حداقل یک پاراگراف بنویسید." };
  }

  const known = new Set(productSlugs());

  // محصولات انتخاب‌شده + محصولاتی که در خود متن لینک داخلی گرفته‌اند
  const picked = String(formData.get("related_products") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => known.has(s));
  const inline = inlineProductSlugs(body).filter((s) => known.has(s));
  const related = [...new Set([...picked, ...inline])];

  // الزام فاز ۴: هر مقاله باید حداقل به یک صفحه محصول لینک داخلی بدهد
  if (related.length === 0) {
    return {
      error:
        "حداقل یک محصول مرتبط انتخاب کنید. هر مقاله باید به یک صفحه محصول لینک داخلی بدهد.",
    };
  }

  // اسلاگ اشتباه در متن، لینک نمی‌شود و بی‌صدا متن ساده می‌ماند — هشدار بدهیم
  const unknownInline = inlineProductSlugs(body).filter((s) => !known.has(s));

  const published = formData.get("published") === "on";
  const existing = await getPostForAdmin(slug);

  // تاریخ انتشار فقط بار اول ست می‌شود تا ویرایش، ترتیب وبلاگ را به‌هم نریزد
  const publishedAt = published
    ? (existing?.published_at ?? new Date().toISOString())
    : (existing?.published_at ?? null);

  try {
    await savePost({
      slug,
      title,
      description,
      excerpt,
      category,
      body,
      related_products: related,
      reading_minutes: readingMinutes(body),
      published,
      published_at: publishedAt,
    });
  } catch (error) {
    console.error("savePost failed:", error);
    return { error: "ذخیره ناموفق بود. اتصال دیتابیس را بررسی کنید." };
  }

  revalidatePath("/admin/blog");

  const warn = unknownInline.length
    ? ` ⚠️ این اسلاگ‌ها در متن پیدا شدند ولی محصول نیستند و لینک نشدند: ${unknownInline.join("، ")}`
    : "";

  return {
    success: published
      ? `منتشر شد — /blog/${slug}${warn}`
      : `به‌عنوان پیش‌نویس ذخیره شد.${warn}`,
  };
}

export async function deletePostAction(formData: FormData): Promise<void> {
  if (!(await currentUser())) return;

  const slug = String(formData.get("slug") ?? "");
  const post = await getPostForAdmin(slug);
  if (!post) return;

  await deletePost(slug, post.category);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}
