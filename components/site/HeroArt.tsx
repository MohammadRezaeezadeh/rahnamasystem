/**
 * گرافیک تزئینی هیرو.
 *
 * از همان هندسه‌ی لوگو ساخته شده: نوارهای موازی‌الاضلاع با شیب متناوب،
 * با ریتم سبز/خاکستری نشان. بالا و پایین با ماسک محو می‌شود تا مثل یک
 * بافت برندی به نظر برسد، نه یک تصویر چسبانده‌شده.
 *
 * عمداً هیچ متن یا دکمه‌ای ندارد — کار تبدیل بر عهده‌ی CTAهای خود هیرو است.
 * در موبایل کاملاً پنهان می‌شود (`hidden lg:block`) تا طول صفحه را زیاد نکند.
 */

const BAND_H = 155;
const SHIFT = 150;
const SPAN = 230;

/** یک نوار: دو وجه که با هم یک موازی‌الاضلاع می‌سازند */
function Band({
  y,
  lean,
  light,
  dark,
}: {
  y: number;
  lean: "right" | "left";
  light: string;
  dark: string;
}) {
  const y2 = y + BAND_H;

  if (lean === "right") {
    return (
      <>
        <path d={`M0 ${y} H${SPAN} L${SHIFT} ${y2} Z`} fill={light} />
        <path d={`M${SPAN} ${y} L${SHIFT + SPAN} ${y2} H${SHIFT} Z`} fill={dark} />
      </>
    );
  }
  return (
    <>
      <path d={`M${SHIFT} ${y} L${SPAN} ${y2} H0 Z`} fill={light} />
      <path d={`M${SHIFT} ${y} H${SHIFT + SPAN} L${SPAN} ${y2} Z`} fill={dark} />
    </>
  );
}

export function HeroArt() {
  return (
    <div aria-hidden className="pointer-events-none relative hidden select-none lg:block">
      {/* هاله نرم پشت گرافیک */}
      <div className="absolute inset-8 rounded-full bg-brand-100/70 blur-3xl" />

      <svg viewBox="0 0 380 620" className="relative mx-auto h-auto w-full max-w-sm">
        <defs>
          {/* محو تدریجی بالا و پایین */}
          <linearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="26%" stopColor="#fff" stopOpacity="1" />
            <stop offset="74%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="heroMask">
            <rect width="380" height="620" fill="url(#heroFade)" />
          </mask>
        </defs>

        {/* ریتم سبز / خاکستری / سبز / خاکستری — همان الگوی نشان */}
        <g mask="url(#heroMask)">
          <Band y={0} lean="right" light="#aede63" dark="#85dc12" />
          <Band y={BAND_H} lean="left" light="#cbd5e1" dark="#94a3b8" />
          <Band y={BAND_H * 2} lean="right" light="#85dc12" dark="#56a80f" />
          <Band y={BAND_H * 3} lean="left" light="#e2e8f0" dark="#cbd5e1" />
        </g>
      </svg>
    </div>
  );
}
