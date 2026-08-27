/**
 * ابزارهای نمایش عدد و متن فارسی.
 *
 * قاعده‌ی سایت:
 *  - قیمت‌ها و اعداد محتوایی → رقم فارسی (۱۲٬۵۰۰٬۰۰۰)
 *  - شماره تلفن، ایمیل، اسلاگ و کد → لاتین با dir="ltr"
 */

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** تبدیل ارقام لاتین به فارسی */
export function toFaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** تبدیل ارقام فارسی/عربی به لاتین - برای ورودی فرم‌ها لازم است */
export function toEnDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** قیمت با جداکننده هزارگان و رقم فارسی، مثلاً «۱۲٬۵۰۰٬۰۰۰ تومان» */
export function formatPrice(amount: number, unit = "تومان"): string {
  const grouped = new Intl.NumberFormat("fa-IR").format(amount);
  return unit ? `${grouped} ${unit}` : grouped;
}

/** عدد ساده با رقم فارسی و جداکننده */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

/** تاریخ شمسی، مثلاً «۵ شهریور ۱۴۰۴» */
export function formatDateFa(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/** تاریخ به فرمت ISO برای اتریبیوت dateTime و schema.org */
export function toISODate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString();
}
