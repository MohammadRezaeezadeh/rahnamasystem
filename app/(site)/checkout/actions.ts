"use server";

import { redirect } from "next/navigation";
import { getProduct } from "@/lib/products";
import { getPricing, isBuyable } from "@/lib/pricing";
import { getProvider } from "@/lib/payments";
import { createOrder, setProviderRef, markFailed } from "@/lib/orders";
import { site } from "@/lib/site";
import { toEnDigits } from "@/lib/format";

export type CheckoutState = { error?: string };

/** موبایل ایران: ۰۹xxxxxxxxx — ورودی فارسی هم پذیرفته می‌شود */
function normalizePhone(raw: string): string | null {
  const digits = toEnDigits(raw).replace(/[\s-]/g, "");
  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^9\d{9}$/.test(digits)) return `0${digits}`;
  if (/^\+989\d{9}$/.test(digits)) return `0${digits.slice(3)}`;
  return null;
}

export async function startCheckoutAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const slug = String(formData.get("slug") ?? "");
  const product = getProduct(slug);
  if (!product) return { error: "محصول یافت نشد." };

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 3) return { error: "نام و نام خانوادگی را کامل وارد کنید." };

  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  if (!phone) return { error: "شماره موبایل معتبر نیست. مثال: ۰۹۱۵۱۱۱۵۸۲۲" };

  const providerId = String(formData.get("provider") ?? "");
  const provider = getProvider(providerId);
  if (!provider || !provider.isConfigured()) {
    return { error: "روش پرداخت انتخابی در دسترس نیست." };
  }

  // قیمت همیشه سمت سرور از دیتابیس خوانده می‌شود.
  // اگر مبلغ را از فرم می‌گرفتیم، کاربر می‌توانست در ابزار توسعه‌دهنده عوضش کند.
  const pricing = await getPricing(slug);
  if (!isBuyable(pricing)) {
    return { error: "خرید آنلاین این بسته فعال نیست. لطفاً تماس بگیرید." };
  }

  let order;
  try {
    order = await createOrder({
      productSlug: slug,
      productName: product.name,
      customerName: name,
      customerPhone: phone,
      amountToman: pricing.price_toman,
      provider: provider.id,
    });
  } catch (error) {
    console.error("createOrder failed:", error);
    return { error: "ثبت سفارش ممکن نشد. لطفاً دوباره تلاش کنید." };
  }

  const result = await provider.createPayment({
    amountToman: pricing.price_toman,
    orderPublicId: order.public_id,
    description: `خرید ${product.name} — ${site.name}`,
    callbackUrl: `${site.url}/checkout/callback/${order.public_id}`,
    customerName: name,
    customerPhone: phone,
  });

  if (!result.ok) {
    await markFailed(order.public_id, result.error);
    return { error: result.error };
  }

  await setProviderRef(order.public_id, result.providerRef);

  // redirect داخل try/catch نباید باشد — با پرتاب یک خطای کنترلی کار می‌کند
  redirect(result.redirectUrl);
}
