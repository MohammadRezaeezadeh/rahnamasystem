import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";
import { getProduct } from "@/lib/products";
import type { LandingPage } from "@/lib/landing";
import { Container, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "./JsonLd";
import { WhatsAppButton } from "./WhatsAppButton";
import { ProductCard } from "./ProductCard";
import { faqSchema } from "@/lib/schema";

/**
 * قالب مشترک لندینگ‌پیج‌ها.
 *
 * هم صفحات «صنف + منطقه» و هم صفحات مقایسه از همین رندر می‌شوند. تفاوت
 * فقط در بلوک‌هایی است که داده دارند: اگر جدول مقایسه خالی باشد نمایش
 * داده نمی‌شود، اگر سؤالات خالی باشد بخش سؤالات نمی‌آید.
 *
 * افزودن صفحه جدید = یک ردیف در دیتابیس. این فایل دست نمی‌خورد.
 */
export function LandingTemplate({ page, trail }: { page: LandingPage; trail: Crumb[] }) {
  const related = page.related_products
    .map((slug) => getProduct(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const whatsappMessage = page.competitor
    ? `سلام، درباره تفاوت سپیدار و ${page.competitor} سؤال داشتم.`
    : `سلام، درباره ${page.industry ?? "نرم‌افزار حسابداری"} سؤال داشتم.`;

  return (
    <>
      {page.faqs.length > 0 && <JsonLd data={faqSchema(page.faqs)} />}

      <Breadcrumbs trail={trail} />

      {/* ---------- سرصفحه ---------- */}
      <Container className="py-10 sm:py-14">
        <div className="max-w-3xl">
          {(page.industry || page.competitor) && (
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-700">
              <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
              {page.competitor
                ? `مقایسه سپیدار و ${page.competitor}`
                : [page.industry, page.area].filter(Boolean).join(" — ")}
            </p>
          )}

          <h1 className="mt-5 text-2xl font-extrabold leading-[1.5] text-ink-900 sm:text-4xl sm:leading-[1.4]">
            {page.h1}
          </h1>

          {page.intro && (
            <p className="mt-5 whitespace-pre-line text-base leading-loose text-ink-600 sm:text-lg">
              {page.intro}
            </p>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/consultation" size="lg">
              مشاوره رایگان بگیرید
            </ButtonLink>
            <a
              href={site.contact.primary.href}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-6 text-base font-bold text-ink-800 transition-colors hover:border-brand-400 hover:text-brand-700"
            >
              تماس: <span className="ltr tnum">{site.contact.primary.label}</span>
            </a>
          </div>
        </div>
      </Container>

      {/* ---------- بدنه ---------- */}
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.7fr_1fr] lg:gap-14">
          <div className="min-w-0">
            {page.sections.map((section) => (
              <section key={section.heading} className="mb-10">
                <h2 className="text-lg font-extrabold text-ink-900 sm:text-xl">
                  {section.heading}
                </h2>
                <div className="mt-3 whitespace-pre-line text-sm leading-loose text-ink-700 sm:text-base">
                  {section.body}
                </div>
              </section>
            ))}

            {/* ---------- جدول مقایسه ---------- */}
            {page.comparison_rows.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-extrabold text-ink-900 sm:text-xl">
                  مقایسه امکانات
                </h2>
                {/* جدول باید داخل خودش اسکرول شود، نه اینکه صفحه را عریض کند */}
                <div className="mt-4 overflow-x-auto rounded-card border border-ink-200 bg-white">
                  <table className="w-full min-w-[34rem] text-start text-sm">
                    <thead className="border-b border-ink-200 bg-ink-50 text-xs text-ink-600">
                      <tr>
                        <th className="px-4 py-3 text-start font-bold">ویژگی</th>
                        <th className="px-4 py-3 text-start font-bold text-brand-700">سپیدار</th>
                        <th className="px-4 py-3 text-start font-bold">
                          {page.competitor ?? "رقیب"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {page.comparison_rows.map((row) => (
                        <tr key={row.feature}>
                          <td className="px-4 py-3 font-semibold text-ink-800">{row.feature}</td>
                          <td className="px-4 py-3 text-brand-800">{row.ours}</td>
                          <td className="px-4 py-3 text-ink-600">{row.theirs}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* ---------- سؤالات متداول ---------- */}
            {page.faqs.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-extrabold text-ink-900 sm:text-xl">سؤالات متداول</h2>
                <div className="mt-4 divide-y divide-ink-200 rounded-card border border-ink-200 bg-white">
                  {page.faqs.map((faq) => (
                    <details key={faq.question} className="group px-5 py-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-start text-sm font-bold text-ink-900">
                        {faq.question}
                        <svg
                          aria-hidden
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="shrink-0 text-ink-400 transition-transform group-open:rotate-180"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </summary>
                      <p className="mt-2.5 whitespace-pre-line text-sm leading-loose text-ink-600">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ---------- ستون کناری ---------- */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-ink-200 bg-white p-6">
              <h2 className="text-sm font-extrabold text-ink-900">سؤالتان را بپرسید</h2>
              <p className="mt-2 text-xs leading-loose text-ink-600">
                در ساعات کاری معمولاً چند دقیقه‌ای پاسخ می‌دهیم.
              </p>
              <div className="mt-5 space-y-2.5">
                <WhatsAppButton message={whatsappMessage} />
                <ButtonLink href="/consultation" variant="secondary" className="w-full">
                  فرم مشاوره
                </ButtonLink>
              </div>
            </div>

            <div className="rounded-card border border-ink-200 bg-ink-50 p-6">
              <h2 className="text-sm font-extrabold text-ink-900">دفتر ما</h2>
              <p className="mt-2 text-xs leading-loose text-ink-600">
                {site.address.city}، {site.address.street}
              </p>
              <p className="mt-3 text-xs leading-loose text-ink-500">{site.openingHoursLabel}</p>
            </div>
          </aside>
        </div>
      </Container>

      {/* ---------- محصولات مرتبط (لینک داخلی سئو) ---------- */}
      {related.length > 0 && (
        <Section className="border-t border-ink-200">
          <h2 className="text-lg font-extrabold text-ink-900">نسخه‌های مرتبط سپیدار</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </Section>
      )}

      {/* ---------- فراخوان پایانی ---------- */}
      <Container className="pb-16">
        <div className="rounded-card bg-brand-800 px-6 py-10 text-center sm:px-12 sm:py-14">
          <h2 className="text-xl font-extrabold text-white sm:text-2xl">
            مطمئن نیستید کدام نسخه مناسب شماست؟
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-loose text-brand-100">
            نوع کسب‌وکارتان را بگویید تا بسته درست و هزینه واقعی را برایتان مشخص کنیم. بدون تعهد
            خرید.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/consultation" variant="secondary" size="lg">
              درخواست مشاوره
            </ButtonLink>
            <a
              href={whatsappLink(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand-500 px-6 text-base font-bold text-white transition-colors hover:bg-brand-700"
            >
              گفتگو در واتساپ
            </a>
          </div>
        </div>
      </Container>

      {/* ---------- لینک به سایر صفحات هم‌نوع ---------- */}
      <Container className="pb-12">
        <Link href="/products" className="text-xs font-bold text-ink-500 hover:text-brand-700">
          مشاهده همه نسخه‌های سپیدار ←
        </Link>
      </Container>
    </>
  );
}
