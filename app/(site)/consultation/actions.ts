"use server";

import { createLead, markNotified, SlotTakenError } from "@/lib/leads";
import { sendLeadNotification } from "@/lib/mail";
import { isValidSlot, formatSlotFull } from "@/lib/availability";
import { getProduct } from "@/lib/products";
import { toEnDigits } from "@/lib/format";

export type ConsultState = {
  error?: string;
  /** پیام موفقیت که به کاربر نشان داده می‌شود */
  success?: string;
  /** شماره پیگیری برای اینکه کاربر بتواند به آن ارجاع بدهد */
  ref?: string;
  /** اگر بازه رزرو شده باشد، فرم باید فهرست زمان‌ها را تازه کند */
  slotConflict?: boolean;
};

/** موبایل ایران: ۰۹xxxxxxxxx — ورودی با ارقام فارسی هم پذیرفته می‌شود */
function normalizePhone(raw: string): string | null {
  const digits = toEnDigits(raw).replace(/[\s-()]/g, "");
  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^9\d{9}$/.test(digits)) return `0${digits}`;
  if (/^\+?989\d{9}$/.test(digits)) return `0${digits.replace(/^\+?98/, "")}`;
  return null;
}

export async function submitConsultationAction(
  _prev: ConsultState,
  formData: FormData,
): Promise<ConsultState> {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 3) return { error: "نام و نام خانوادگی را کامل وارد کنید." };

  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  if (!phone) return { error: "شماره موبایل معتبر نیست. مثال: ۰۹۱۵۱۱۱۵۸۲۲" };

  const businessType = String(formData.get("business_type") ?? "").trim() || null;
  const message = String(formData.get("message") ?? "").trim() || null;

  const productSlugRaw = String(formData.get("product") ?? "").trim();
  const productSlug = getProduct(productSlugRaw) ? productSlugRaw : null;

  // زمان رزرو اختیاری است. اگر آمد، سمت سرور اعتبارسنجی می‌شود چون
  // مقدارهای فرم قابل دستکاری‌اند و کسی می‌تواند ساعت ۳ بامداد بفرستد.
  const slotRaw = String(formData.get("slot") ?? "").trim();
  let preferredSlot: string | null = null;
  if (slotRaw && slotRaw !== "any") {
    if (!isValidSlot(slotRaw)) {
      return { error: "زمان انتخابی معتبر نیست. لطفاً دوباره یک زمان انتخاب کنید.", slotConflict: true };
    }
    preferredSlot = new Date(slotRaw).toISOString();
  }

  let lead;
  try {
    lead = await createLead({
      name,
      phone,
      businessType,
      message,
      productSlug,
      preferredSlot,
      source: preferredSlot ? "consultation-booking" : "consultation-form",
    });
  } catch (error) {
    if (error instanceof SlotTakenError) {
      return { error: error.message, slotConflict: true };
    }
    console.error("createLead failed:", error);
    return { error: "ثبت درخواست ممکن نشد. لطفاً تماس بگیرید یا دوباره تلاش کنید." };
  }

  // سرنخ از قبل ذخیره شده؛ خطای ایمیل نباید فرم را ناموفق نشان دهد.
  const sent = await sendLeadNotification(lead);
  if (sent) await markNotified(lead.public_id);

  return {
    success: preferredSlot
      ? `تماس شما برای ${formatSlotFull(preferredSlot)} ثبت شد.`
      : "درخواست شما ثبت شد. در اولین فرصت کاری تماس می‌گیریم.",
    ref: lead.public_id,
  };
}
