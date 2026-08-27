import "server-only";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "./types";

/**
 * زرین‌پال — درگاه پرداخت نقدی (API نسخه ۴).
 *
 * ⚠️ نکته‌ای که بیشترین اشتباه را می‌سازد: زرین‌پال مبلغ را به **ریال**
 * می‌گیرد، ولی ما همه‌جای سایت به **تومان** نمایش می‌دهیم. تبدیل فقط و فقط
 * در همین فایل انجام می‌شود (×۱۰) تا جای دیگری تکرار نشود.
 */

const BASE = "https://payment.zarinpal.com/pg/v4/payment";
const START_PAY = "https://payment.zarinpal.com/pg/StartPay";

/** درگاه آزمایشی زرین‌پال - برای تست بدون پول واقعی */
const SANDBOX_BASE = "https://sandbox.zarinpal.com/pg/v4/payment";
const SANDBOX_START_PAY = "https://sandbox.zarinpal.com/pg/StartPay";

function isSandbox() {
  return process.env.ZARINPAL_SANDBOX === "true";
}

function endpoints() {
  return isSandbox()
    ? { base: SANDBOX_BASE, startPay: SANDBOX_START_PAY }
    : { base: BASE, startPay: START_PAY };
}

const toRial = (toman: number) => toman * 10;

type RequestResponse = {
  data?: { code?: number; authority?: string; message?: string };
  errors?: { code?: number; message?: string } | unknown[];
};

type VerifyResponse = {
  data?: { code?: number; ref_id?: number; message?: string; card_pan?: string };
  errors?: { code?: number; message?: string } | unknown[];
};

function errorText(payload: { errors?: unknown }, fallback: string): string {
  const e = payload.errors;
  if (e && !Array.isArray(e) && typeof e === "object" && "message" in e) {
    return String((e as { message: unknown }).message);
  }
  return fallback;
}

export const zarinpal: PaymentProvider = {
  id: "zarinpal",
  label: "پرداخت آنلاین",
  hint: "پرداخت یک‌جا با کارت بانکی از طریق زرین‌پال",

  isConfigured() {
    return Boolean(process.env.ZARINPAL_MERCHANT_ID);
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const merchant = process.env.ZARINPAL_MERCHANT_ID;
    if (!merchant) return { ok: false, error: "درگاه زرین‌پال پیکربندی نشده است." };

    const { base, startPay } = endpoints();

    try {
      const res = await fetch(`${base}/request.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          merchant_id: merchant,
          amount: toRial(input.amountToman),
          description: input.description,
          callback_url: input.callbackUrl,
          metadata: { mobile: input.customerPhone },
        }),
        cache: "no-store",
      });

      const payload = (await res.json()) as RequestResponse;

      if (payload.data?.code === 100 && payload.data.authority) {
        return {
          ok: true,
          providerRef: payload.data.authority,
          redirectUrl: `${startPay}/${payload.data.authority}`,
        };
      }

      return { ok: false, error: errorText(payload, "درگاه پرداخت پاسخ نامعتبر داد.") };
    } catch (error) {
      console.error("zarinpal.createPayment failed:", error);
      return { ok: false, error: "ارتباط با درگاه پرداخت برقرار نشد." };
    }
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const merchant = process.env.ZARINPAL_MERCHANT_ID;
    if (!merchant) return { ok: false, error: "درگاه زرین‌پال پیکربندی نشده است." };

    const status = input.params.Status ?? input.params.status;
    const authority = input.params.Authority ?? input.params.authority ?? input.providerRef;

    if (status !== "OK") {
      return { ok: false, error: "پرداخت توسط شما لغو شد.", canceledByUser: true };
    }
    if (!authority) return { ok: false, error: "شناسه پرداخت دریافت نشد." };

    // شناسه بازگشتی باید همانی باشد که هنگام ساخت سفارش ذخیره کردیم،
    // وگرنه کسی می‌تواند با authority یک سفارش دیگر این سفارش را «پرداخت‌شده» کند.
    if (input.providerRef && authority !== input.providerRef) {
      return { ok: false, error: "شناسه پرداخت با سفارش هم‌خوانی ندارد." };
    }

    try {
      const res = await fetch(`${endpoints().base}/verify.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          merchant_id: merchant,
          amount: toRial(input.amountToman),
          authority,
        }),
        cache: "no-store",
      });

      const payload = (await res.json()) as VerifyResponse;

      // ۱۰۰ = تأیید شد، ۱۰۱ = قبلاً تأیید شده بود (کاربر صفحه را دوباره باز کرده)
      if (payload.data?.code === 100 || payload.data?.code === 101) {
        return { ok: true, paymentRef: String(payload.data.ref_id ?? authority) };
      }

      return { ok: false, error: errorText(payload, "تأیید پرداخت ناموفق بود.") };
    } catch (error) {
      console.error("zarinpal.verifyPayment failed:", error);
      return { ok: false, error: "ارتباط با درگاه برای تأیید پرداخت برقرار نشد." };
    }
  },
};
