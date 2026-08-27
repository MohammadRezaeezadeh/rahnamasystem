/**
 * واسط مشترک درگاه‌های پرداخت.
 *
 * هر درگاه فقط این دو کار را انجام می‌دهد: ساختن پرداخت (و برگرداندن آدرسی
 * که کاربر باید به آن برود) و تأیید پرداخت بعد از بازگشت.
 *
 * دلیل وجود این لایه: زرین‌پال و اسنپ‌پی از نظر مفهومی متفاوت‌اند
 * (یکی درگاه معمولی است، دیگری اعتبار خرید قسطی) ولی جریان سفارش در سایت
 * باید برای هر دو یکسان بماند. اضافه‌کردن درگاه سوم = یک فایل جدید.
 */

export type ProviderId = "zarinpal" | "snappay";

export type CreatePaymentInput = {
  /** مبلغ به تومان — هر درگاه خودش به واحد موردنیازش تبدیل می‌کند */
  amountToman: number;
  orderPublicId: string;
  description: string;
  callbackUrl: string;
  customerPhone: string;
  customerName: string;
};

export type CreatePaymentResult =
  | { ok: true; redirectUrl: string; providerRef: string }
  | { ok: false; error: string };

export type VerifyPaymentInput = {
  /** مقدارهایی که درگاه در URL بازگشت فرستاده */
  params: Record<string, string>;
  amountToman: number;
  providerRef: string | null;
};

export type VerifyPaymentResult =
  | { ok: true; paymentRef: string }
  | { ok: false; error: string; canceledByUser?: boolean };

export interface PaymentProvider {
  id: ProviderId;
  /** نامی که به کاربر نشان داده می‌شود */
  label: string;
  /** توضیح یک‌خطی زیر گزینه در صفحه تسویه */
  hint: string;
  /** آیا کلیدهای لازم ست شده‌اند؟ اگر نه، گزینه در صفحه تسویه نمایش داده نمی‌شود */
  isConfigured(): boolean;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
}
