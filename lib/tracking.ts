/**
 * رویدادها و قواعد امتیازدهی رفتار کاربر.
 *
 * ⚠️ تصمیم معماری مهم:
 * امتیازدهی و پاپ‌آپ عمداً به گوگل تگ منیجر وابسته **نیستند**. منطق در
 * کد خودمان اجرا می‌شود و رویدادها فقط به dataLayer هم push می‌شوند تا
 * اگر GTM بود آن‌ها را بخواند.
 *
 * دلیلش: اسکریپت گوگل در ایران گاهی کند یا مسدود است. اگر امتیازدهی روی
 * GTM سوار می‌شد، برای بخشی از بازدیدکننده‌ها هیچ‌وقت کار نمی‌کرد و
 * تیم فروش هیچ سرنخی نمی‌دید — و بدتر اینکه متوجه هم نمی‌شد.
 *
 * این فایل خالص است و در کلاینت و سرور هر دو استفاده می‌شود.
 */

export const TRACK_EVENTS = {
  productView: "product_view",
  productRepeatView: "product_repeat_view",
  priceDwell: "price_dwell",
  formStart: "form_start",
  formAbandon: "form_abandon",
  whatsappClick: "whatsapp_click",
  checkoutStart: "checkout_start",
  blogToProduct: "blog_to_product",
} as const;

export type TrackEvent = (typeof TRACK_EVENTS)[keyof typeof TRACK_EVENTS];

/**
 * وزن هر رفتار.
 *
 * منطق پشت اعداد: هرچه رفتار به «قصد خرید» نزدیک‌تر باشد امتیاز بیشتری
 * دارد. دیدن یک صفحه محصول ممکن است تصادفی باشد؛ شروع تسویه حساب نه.
 */
export const SCORE_WEIGHTS: Record<TrackEvent, number> = {
  [TRACK_EVENTS.productView]: 1,
  // بازدید دوباره از همان محصول یعنی دارد جدی بررسی می‌کند
  [TRACK_EVENTS.productRepeatView]: 5,
  // ماندن روی قیمت یعنی دارد تصمیم می‌گیرد
  [TRACK_EVENTS.priceDwell]: 5,
  [TRACK_EVENTS.blogToProduct]: 3,
  [TRACK_EVENTS.formStart]: 8,
  [TRACK_EVENTS.formAbandon]: 4,
  [TRACK_EVENTS.whatsappClick]: 10,
  [TRACK_EVENTS.checkoutStart]: 15,
};

/** از این امتیاز به بالا، پاپ‌آپ «سؤالی داری؟» نمایش داده می‌شود */
export const POPUP_THRESHOLD = 20;

/** چند ثانیه ماندن روی صفحه قیمت‌دار، یک رویداد priceDwell می‌سازد */
export const DWELL_SECONDS = 30;

/** کلیدهای localStorage */
export const STORAGE = {
  score: "rs_score",
  seenProducts: "rs_products",
  popupShown: "rs_popup",
} as const;

/** برچسب فارسی امتیاز برای پنل مدیریت */
export function scoreLabel(score: number): { label: string; tone: "hot" | "warm" | "cold" } {
  if (score >= 25) return { label: "داغ", tone: "hot" };
  if (score >= 10) return { label: "علاقه‌مند", tone: "warm" };
  return { label: "سرد", tone: "cold" };
}
