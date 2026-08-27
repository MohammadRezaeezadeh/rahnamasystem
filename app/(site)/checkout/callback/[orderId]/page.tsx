import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder, markPaid, markFailed } from "@/lib/orders";
import { getProvider } from "@/lib/payments";
import { site, whatsappLink } from "@/lib/site";
import { Container } from "@/components/ui/Section";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "نتیجه پرداخت",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CallbackPage({ params, searchParams }: Props) {
  const { orderId } = await params;
  const sp = await searchParams;

  const order = await getOrder(orderId);
  if (!order) notFound();

  // آرایه‌ها را به مقدار تکی تبدیل کن تا درگاه‌ها با هر شکل query کار کنند
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") flat[k] = v;
    else if (Array.isArray(v) && v[0]) flat[k] = v[0];
  }

  let paid = order.status === "paid";
  let message = order.error_message ?? "";
  let paymentRef = order.payment_ref ?? "";

  // فقط سفارش‌های در انتظار تأیید می‌شوند؛ اگر کاربر صفحه را دوباره باز کند
  // نتیجه‌ی ذخیره‌شده نمایش داده می‌شود و درگاه دوباره صدا زده نمی‌شود.
  if (order.status === "pending") {
    const provider = getProvider(order.provider);
    if (!provider) {
      message = "درگاه پرداخت این سفارش شناسایی نشد.";
      await markFailed(order.public_id, message);
    } else {
      const result = await provider.verifyPayment({
        params: flat,
        amountToman: order.amount_toman,
        providerRef: order.provider_ref,
      });

      if (result.ok) {
        await markPaid(order.public_id, result.paymentRef);
        paid = true;
        paymentRef = result.paymentRef;
      } else {
        await markFailed(order.public_id, result.error, result.canceledByUser);
        message = result.error;
      }
    }
  }

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md rounded-card border border-ink-200 bg-white p-8 text-center">
        <div
          aria-hidden
          className={`mx-auto grid size-14 place-items-center rounded-full ${
            paid ? "bg-brand-100 text-brand-700" : "bg-red-50 text-red-600"
          }`}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {paid ? <path d="M20 6 9 17l-5-5" /> : <path d="M18 6 6 18M6 6l12 12" />}
          </svg>
        </div>

        <h1 className="mt-5 text-xl font-extrabold text-ink-900">
          {paid ? "پرداخت با موفقیت انجام شد" : "پرداخت انجام نشد"}
        </h1>

        <p className="mt-3 text-sm leading-loose text-ink-600">
          {paid
            ? "همکاران ما به‌زودی برای هماهنگی نصب و آموزش با شما تماس می‌گیرند."
            : message || "متأسفانه پرداخت شما تکمیل نشد."}
        </p>

        <dl className="mt-6 space-y-2 rounded-xl bg-ink-50 p-4 text-start text-xs">
          <Row label="محصول" value={order.product_name} />
          <Row label="مبلغ" value={formatPrice(order.amount_toman)} ltr />
          <Row label="شماره سفارش" value={order.public_id} ltr />
          {paid && paymentRef && <Row label="کد پیگیری" value={paymentRef} ltr />}
        </dl>

        <div className="mt-7 space-y-2.5">
          {paid ? (
            <Link
              href="/"
              className="flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white"
            >
              بازگشت به صفحه اصلی
            </Link>
          ) : (
            <>
              <Link
                href={`/checkout/${order.product_slug}`}
                className="flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white"
              >
                تلاش دوباره
              </Link>
              <a
                href={whatsappLink(`سلام، در پرداخت سفارش ${order.public_id} مشکل داشتم.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 w-full items-center justify-center rounded-xl border border-ink-200 px-5 text-sm font-bold text-ink-800"
              >
                پیگیری در واتساپ
              </a>
            </>
          )}
        </div>

        <p className="mt-5 border-t border-ink-200 pt-4 text-xs text-ink-500">
          سؤالی دارید؟{" "}
          <a href={site.contact.primary.href} className="ltr tnum font-bold text-brand-700">
            {site.contact.primary.label}
          </a>
        </p>
      </div>
    </Container>
  );
}

function Row({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className={`font-bold text-ink-900 ${ltr ? "ltr tnum" : ""}`}>{value}</dd>
    </div>
  );
}
