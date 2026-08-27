/**
 * نشان رهنما سیستم شرق — بازسازی برداری از لوگوی رسمی.
 *
 * ساختار: دو بلوک تیره در سمت چپ + سه نوار موازی‌الاضلاع زیگزاگی
 * (سبز / تیره / سبز). هر نوار با یک قطر به دو وجه روشن و تیره تقسیم
 * می‌شود؛ همان جلوه‌ی «کاغذ تاشده» لوگوی اصلی.
 *
 * SVG است، پس در هر اندازه‌ای تیز می‌ماند و حجمش نزدیک صفر است.
 * برای استفاده روی پس‌زمینه تیره، prop مربوط به رنگ‌ها را عوض کنید.
 */

const C = {
  inkDark: "#2a2b2e",
  inkLight: "#56595e",
  greenDark: "#56a80f",
  greenLight: "#85dc12",
} as const;

export function LogoMark({
  className = "",
  colors = C,
}: {
  className?: string;
  colors?: { inkDark: string; inkLight: string; greenDark: string; greenLight: string };
}) {
  return (
    <svg
      viewBox="0 0 1060 900"
      className={className}
      role="img"
      aria-hidden
      focusable="false"
      shapeRendering="geometricPrecision"
    >
      {/* بلوک تیره بالا-چپ */}
      <rect x="0" y="0" width="365" height="210" rx="30" fill={colors.inkDark} />
      {/* بلوک تیره پایین-چپ */}
      <rect x="0" y="420" width="365" height="480" rx="30" fill={colors.inkDark} />

      {/* نوار ۱ — سبز، شیب به راست */}
      <path d="M365 0 H780 L645 300 Z" fill={colors.greenDark} />
      <path d="M780 0 L1060 300 H645 Z" fill={colors.greenLight} />

      {/* نوار ۲ — تیره، شیب به چپ */}
      <path d="M645 300 L780 600 H365 Z" fill={colors.inkLight} />
      <path d="M645 300 H1060 L780 600 Z" fill={colors.inkDark} />

      {/* نوار ۳ — سبز، شیب به راست */}
      <path d="M365 600 H780 L645 900 Z" fill={colors.greenDark} />
      <path d="M780 600 L1060 900 H645 Z" fill={colors.greenLight} />
    </svg>
  );
}

/** رنگ‌بندی نشان برای پس‌زمینه‌های تیره */
export const logoOnDark = {
  inkDark: "#ffffff",
  inkLight: "#d4d7dc",
  greenDark: "#6fbc0e",
  greenLight: "#a5e84a",
};
