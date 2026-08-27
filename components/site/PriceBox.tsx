import { site } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import { isBuyable, type Pricing } from "@/lib/pricing";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppButton } from "./WhatsAppButton";

/**
 * کارت قیمت و خرید در صفحه محصول.
 *
 * سه حالت دارد و همه‌شان باید کار کنند:
 *   ۱. قیمت دارد و خرید فعال است → مبلغ + دکمه خرید
 *   ۲. قیمت دارد ولی خرید غیرفعال → مبلغ + دکمه مشاوره
 *   ۳. قیمت ندارد → «استعلام قیمت» + دکمه مشاوره
 * حالت سوم پیش‌فرض است، پس تا وقتی مدیر قیمتی وارد نکرده هم صفحه سالم است.
 *
 * دکمه واتساپ در هر سه حالت هست — سریع‌ترین مسیر تبدیل است و نباید
 * پشت شرط قیمت پنهان شود.
 */
export function PriceBox({
  slug,
  productName,
  pricing,
}: {
  slug: string;
  productName: string;
  pricing: Pricing | null;
}) {
  // تصمیم خرید فقط به کلید «خرید آنلاین» در پنل مدیریت وابسته است.
  // عمداً وضعیت درگاه (متغیر محیطی) را اینجا نمی‌خوانیم: این صفحه کش می‌شود و
  // اگر درگاه بعداً فعال شود، صفحه تا زمان بازتولید حالت قدیمی را نشان می‌دهد.
  // صفحه تسویه به‌عنوان تور ایمنی همچنان نبودِ درگاه را مدیریت می‌کند.
  const buyable = isBuyable(pricing);

  return (
    <div className="rounded-card border border-ink-200 bg-white p-6 shadow-soft">
      <p className="text-xs font-bold text-ink-500">قیمت این بسته</p>

      {pricing?.price_toman ? (
        <p className="tnum mt-2 text-2xl font-extrabold text-ink-900">
          {formatPrice(pricing.price_toman)}
        </p>
      ) : (
        <p className="mt-2 text-lg font-extrabold text-ink-900">استعلام قیمت</p>
      )}

      <p className="mt-2 text-xs leading-loose text-ink-500">
        {pricing?.price_note ??
          "قیمت به تعداد کاربر و ماژول‌های انتخابی بستگی دارد. برای قیمت دقیق تماس بگیرید."}
      </p>

      <div className="mt-6 space-y-3">
        <WhatsAppButton
          message={`سلام، درباره «${productName}» سؤال داشتم.`}
          label="سؤال سریع در واتساپ"
        />

        {buyable ? (
          <>
            <ButtonLink href={`/checkout/${slug}`} size="lg" className="w-full">
              خرید و پرداخت
            </ButtonLink>
            <ButtonLink
              href={`/consultation?product=${slug}`}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              مشاوره قبل از خرید
            </ButtonLink>
          </>
        ) : (
          <>
            <ButtonLink href={`/consultation?product=${slug}`} size="lg" className="w-full">
              درخواست مشاوره و قیمت
            </ButtonLink>
            <a
              href={site.contact.primary.href}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-ink-200 px-5 text-sm font-bold text-ink-800 transition-colors hover:border-brand-400 hover:text-brand-700"
            >
              <span className="ltr tnum">{site.contact.primary.label}</span>
            </a>
          </>
        )}
      </div>

      <p className="mt-5 border-t border-ink-200 pt-4 text-xs leading-loose text-ink-500">
        نصب، انتقال اطلاعات و آموزش اولیه در مشهد به‌صورت حضوری انجام می‌شود.
      </p>
    </div>
  );
}
