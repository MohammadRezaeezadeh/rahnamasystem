"use server";

import { redirect } from "next/navigation";
import { login, logout, currentUser } from "@/lib/auth";
import { savePricing } from "@/lib/pricing";
import { getProduct } from "@/lib/products";
import { toEnDigits } from "@/lib/format";

export type FormState = { error?: string; success?: string };

// ---------------------------------------------------------------- ورود

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!username || !password) return { error: "نام کاربری و رمز عبور را وارد کنید." };

  try {
    const user = await login(username, password);
    if (!user) return { error: "نام کاربری یا رمز عبور اشتباه است." };
  } catch (error) {
    console.error("login failed:", error);
    return { error: "ورود ممکن نشد. اتصال دیتابیس را بررسی کنید." };
  }

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/admin/login");
}

// ---------------------------------------------------------------- قیمت

/**
 * پاک‌سازی ورودی قیمت.
 * مدیر ممکن است «۱۲,۵۰۰,۰۰۰» یا «12500000» یا «۱۲۵۰۰۰۰۰» بنویسد —
 * همه باید یک عدد شوند.
 */
function parseToman(raw: string): number | null {
  const cleaned = toEnDigits(raw).replace(/[,٬\s]/g, "").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export async function savePricingAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { error: "نشست شما منقضی شده. دوباره وارد شوید." };

  const slug = String(formData.get("slug") ?? "");
  if (!getProduct(slug)) return { error: "محصول نامعتبر است." };

  const rawPrice = String(formData.get("price_toman") ?? "");
  const price = parseToman(rawPrice);

  // ورودی غیرعددی نباید بی‌صدا به «استعلام قیمت» تبدیل شود
  if (rawPrice.trim() && price === null) {
    return { error: "قیمت باید یک عدد باشد. برای «استعلام قیمت» فیلد را خالی بگذارید." };
  }

  const purchasable = formData.get("purchasable") === "on";
  if (purchasable && !price) {
    return { error: "برای فعال‌کردن خرید آنلاین باید قیمت وارد شود." };
  }

  try {
    await savePricing({
      slug,
      price_toman: price,
      description: (String(formData.get("description") ?? "").trim() || null) as string | null,
      price_note: (String(formData.get("price_note") ?? "").trim() || null) as string | null,
      purchasable,
    });
  } catch (error) {
    console.error("savePricing failed:", error);
    return { error: "ذخیره ناموفق بود. اتصال دیتابیس را بررسی کنید." };
  }

  return { success: "ذخیره شد و روی سایت اعمال گردید." };
}
