import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, productSlugs, productsSorted } from "@/lib/products";
import { site } from "@/lib/site";
import { Container, Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductCard } from "@/components/site/ProductCard";
import { JsonLd } from "@/components/site/JsonLd";
import { productSchema } from "@/lib/schema";
import { getPricing } from "@/lib/pricing";
import { PriceBox } from "@/components/site/PriceBox";

/**
 * صفحات در زمان build ساخته می‌شوند و هر ساعت تازه می‌شوند.
 * تغییر قیمت از پنل مدیریت بلافاصله کش را باطل می‌کند (revalidateTag)،
 * پس این عدد فقط یک تور ایمنی است.
 */
export const revalidate = 3600;

/** همه صفحات محصول در زمان build ساخته می‌شوند — سریع‌ترین حالت ممکن برای گوگل و کاربر */
export function generateStaticParams() {
  return productSlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};

  return {
    title: `${product.name} — قیمت و امکانات`,
    description: `${product.summary} ${product.name} از نمایندگی رسمی سپیدار در مشهد، به‌همراه نصب، آموزش و پشتیبانی.`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} | ${site.name}`,
      description: product.summary,
      url: `${site.url}/products/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const pricing = await getPricing(product.slug);

  const related = productsSorted.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={productSchema(product, pricing?.price_toman ?? undefined)} />

      <Breadcrumbs
        trail={[
          { name: "محصولات", href: "/products" },
          { name: product.shortName, href: `/products/${product.slug}` },
        ]}
      />

      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* ستون محتوا */}
          <div>
            <h1 className="text-2xl font-extrabold leading-[1.5] text-ink-900 sm:text-4xl sm:leading-[1.4]">
              {product.name}
            </h1>
            <p className="mt-4 text-base leading-loose text-ink-600 sm:text-lg">{product.summary}</p>

            <section className="mt-10">
              <h2 className="text-lg font-extrabold text-ink-900">مناسب چه کسب‌وکاری است؟</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {product.audience.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 rounded-xl border border-ink-200 bg-white p-4 text-sm text-ink-700"
                  >
                    <svg
                      aria-hidden
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="mt-1 shrink-0 text-brand-600"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-lg font-extrabold text-ink-900">امکانات کلیدی</h2>
              <ul className="mt-4 space-y-3">
                {product.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-loose text-ink-700">
                    <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* توضیح تکمیلی که مدیر سایت از پنل وارد می‌کند */}
            {pricing?.description && (
              <section className="mt-10">
                <h2 className="text-lg font-extrabold text-ink-900">توضیحات بیشتر</h2>
                <div className="mt-4 whitespace-pre-line text-sm leading-loose text-ink-700">
                  {pricing.description}
                </div>
              </section>
            )}
          </div>

          {/* کارت خرید — چسبان در دسکتاپ */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <PriceBox slug={product.slug} pricing={pricing} />
          </aside>
        </div>
      </Container>

      {/* محصولات مرتبط */}
      <Section className="border-t border-ink-200">
        <h2 className="text-lg font-extrabold text-ink-900">نسخه‌های دیگر سپیدار</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </Section>
    </>
  );
}
