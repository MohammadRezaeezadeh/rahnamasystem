import { NextResponse } from "next/server";
import { createLead, SlotTakenError } from "@/lib/leads";
import { toEnDigits } from "@/lib/format";

/**
 * ثبت سرنخ نیمه‌کاره.
 *
 * وقتی کاربر فرم مشاوره را شروع می‌کند، شماره‌اش را می‌نویسد و بدون ارسال
 * صفحه را می‌بندد، این مسیر با navigator.sendBeacon صدا زده می‌شود.
 *
 * ⚠️ ملاحظه‌ای که باید بدانید: این کار داده‌ای را ذخیره می‌کند که کاربر
 * آگاهانه ارسال نکرده. برای همین در خود فرم صریحاً نوشته شده که ممکن است
 * برای پیگیری تماس بگیریم. بدون آن اطلاع‌رسانی، این کار برای کاربر
 * غافلگیرکننده و از نظر حریم خصوصی قابل ایراد است.
 *
 * چرا route handler و نه Server Action: sendBeacon فقط یک POST ساده
 * می‌فرستد و پروتکل Server Action را نمی‌شناسد.
 */

export const runtime = "nodejs";

/** موبایل ایران — بدون شماره معتبر، سرنخ ناقص هیچ ارزشی ندارد */
function normalizePhone(raw: string): string | null {
  const digits = toEnDigits(raw).replace(/[\s-()]/g, "");
  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^9\d{9}$/.test(digits)) return `0${digits}`;
  if (/^\+?989\d{9}$/.test(digits)) return `0${digits.replace(/^\+?98/, "")}`;
  return null;
}

/**
 * محدودیت ساده نرخ در حافظه.
 * مسیر عمومی است، پس بدون این می‌شود جدول را پر کرد. برای یک سایت
 * تک‌سروری کافی است؛ اگر روزی چند نمونه اجرا شد باید به دیتابیس منتقل شود.
 */
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    // جلوگیری از رشد بی‌نهایت نقشه
    if (hits.size > 5000) {
      for (const [key, value] of hits) if (now > value.resetAt) hits.delete(key);
    }
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

const clip = (value: unknown, max: number): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
};

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const phone = normalizePhone(String(payload.phone ?? ""));
  // بدون شماره معتبر چیزی ذخیره نمی‌کنیم — نه قابل پیگیری است نه ارزشی دارد.
  // وضعیت ۲۰۰ برمی‌گردانیم نه ۲۰۴: پاسخ ۲۰۴ طبق استاندارد نمی‌تواند بدنه
  // داشته باشد و NextResponse.json با آن خطا می‌دهد. sendBeacon هم پاسخ را
  // نمی‌خواند، پس کد وضعیت اینجا فقط برای دیباگ است.
  if (!phone) return NextResponse.json({ ok: false, reason: "invalid-phone" });

  const rawScore = Number(payload.score);
  const score = Number.isFinite(rawScore) ? Math.min(Math.max(rawScore, 0), 500) : 0;

  try {
    await createLead({
      name: clip(payload.name, 120) ?? "—",
      phone,
      businessType: clip(payload.businessType, 120),
      message: clip(payload.message, 1000),
      productSlug: clip(payload.productSlug, 60),
      preferredSlot: null,
      source: "form-abandoned",
      isComplete: false,
      score,
    });
  } catch (error) {
    if (error instanceof SlotTakenError) {
      return NextResponse.json({ ok: false }, { status: 409 });
    }
    console.error("ثبت سرنخ نیمه‌کاره ناموفق بود:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
