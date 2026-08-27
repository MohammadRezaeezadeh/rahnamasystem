import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { getPricing, isBuyable } from "@/lib/pricing";
import { availableProviders } from "@/lib/payments";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/Section";
import { formatPrice } from "@/lib/format";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تسویه حساب",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ slug: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const pricing = await getPricing(slug);
  const providers = availableProviders();

  // اگر خرید آنلاین ممکن نیست، کاربر نباید به یک فرم بن‌بست برسد
  if (!isBuyable(pricing) || providers.length === 0) {
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-md rounded-card border border-ink-200 bg-white p-8 text-center">
          <h1 className="text-lg font-extrabold text-ink-900">
            خرید آنلاین این بسته فعال نیست
          </h1>
          <p className="mt-3 text-sm leading-loose text-ink-600">
            برای خرید {product.name} با ما تماس بگیرید تا قیمت دقیق و شرایط پرداخت را برایتان
            مشخص کنیم.
          </p>
          <a
            href={site.contact.primary.href}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 text-sm font-bold text-white"
          >
            تماس با <span className="ltr tnum">{site.contact.primary.label}</span>
          </a>
          <p className="mt-4">
            <Link
              href={`/products/${slug}`}
              className="text-xs font-bold text-ink-500 hover:text-brand-700"
            >
              بازگشت به صفحه محصول
            </Link>
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/products/${slug}`}
          className="inline-flex min-h-10 items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-brand-700"
        >
          <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          بازگشت به صفحه محصول
        </Link>

        <h1 className="mt-4 text-2xl font-extrabold text-ink-900">تسویه حساب</h1>

        {/* خلاصه سفارش — کاربر باید قبل از پرداخت دقیقاً بداند چه می‌خرد */}
        <div className="mt-6 rounded-card border border-ink-200 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-bold text-ink-900">{product.name}</span>
            <span className="tnum text-lg font-extrabold text-brand-700">
              {formatPrice(pricing.price_toman)}
            </span>
          </div>
          {pricing.price_note && (
            <p className="mt-2 text-xs leading-loose text-ink-500">{pricing.price_note}</p>
          )}
        </div>

        <div className="mt-8">
          <CheckoutForm
            slug={slug}
            amountToman={pricing.price_toman}
            providers={providers.map((p) => ({ id: p.id, label: p.label, hint: p.hint }))}
          />
        </div>
      </div>
    </Container>
  );
}
