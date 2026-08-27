import "server-only";
import type { CreatePaymentResult, PaymentProvider, VerifyPaymentResult } from "./types";

/**
 * اسنپ‌پی — خرید قسطی (BNPL).
 *
 * ⚠️ وضعیت: منتظر مستندات رسمی.
 *
 * برخلاف زرین‌پال، API اسنپ‌پی عمومی منتشر نشده. آدرس endpointها، نام
 * فیلدها و روش امضای درخواست فقط بعد از امضای قرارداد پذیرندگی به شما داده
 * می‌شود. من این‌ها را حدس نمی‌زنم — کد حدسی که کامپایل می‌شود ولی کار
 * نمی‌کند، بدتر از نبودن کد است، چون در روز راه‌اندازی تازه معلوم می‌شود.
 *
 * کد قبلی پروژه (_legacy/server/services/payment.js) دقیقاً همین اشتباه را
 * داشت: اسمش SnapPay بود ولی ساختار زرین‌پال داشت.
 *
 * ────────────────────────────────────────────────────────────
 * وقتی مستندات رسید، فقط سه چیز اینجا عوض می‌شود:
 *   ۱. ثابت‌های endpoint
 *   ۲. بدنه‌ی درخواست در createPayment
 *   ۳. منطق تأیید در verifyPayment
 * هیچ فایل دیگری از سایت دست نمی‌خورد — جریان سفارش و صفحه تسویه
 * از قبل با واسط PaymentProvider نوشته شده‌اند.
 * ────────────────────────────────────────────────────────────
 */

const NOT_READY =
  "پرداخت قسطی هنوز فعال نشده است. برای خرید اقساطی لطفاً تماس بگیرید.";

export const snappay: PaymentProvider = {
  id: "snappay",
  label: "خرید قسطی",
  hint: "پرداخت در چند قسط از طریق اسنپ‌پی",

  isConfigured() {
    // هر سه مقدار لازم است؛ تا وقتی نباشند این گزینه در صفحه تسویه
    // اصلاً نمایش داده نمی‌شود و کاربر به بن‌بست نمی‌خورد.
    return Boolean(
      process.env.SNAPPAY_MERCHANT_CODE &&
        process.env.SNAPPAY_API_KEY &&
        process.env.SNAPPAY_API_URL,
    );
  },

  async createPayment(): Promise<CreatePaymentResult> {
    if (!this.isConfigured()) return { ok: false, error: NOT_READY };

    // TODO(مستندات اسنپ‌پی): درخواست ساخت تراکنش را اینجا بنویسید.
    // ساختار مورد انتظار: POST به آدرس پذیرندگی با merchant code و مبلغ،
    // پاسخ شامل یک شناسه تراکنش و یک آدرس هدایت کاربر.
    return {
      ok: false,
      error: "اتصال به اسنپ‌پی هنوز پیاده‌سازی نشده است (در انتظار مستندات پذیرندگی).",
    };
  },

  async verifyPayment(): Promise<VerifyPaymentResult> {
    if (!this.isConfigured()) return { ok: false, error: NOT_READY };

    // TODO(مستندات اسنپ‌پی): تأیید نهایی تراکنش بعد از بازگشت کاربر.
    return {
      ok: false,
      error: "تأیید پرداخت اسنپ‌پی هنوز پیاده‌سازی نشده است.",
    };
  },
};
