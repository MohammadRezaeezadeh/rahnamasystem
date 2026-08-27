import type { Metadata } from "next";
import Link from "next/link";
import { publishedPages } from "@/lib/landing";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "مقایسه سپیدار با سایر نرم‌افزارهای حسابداری",
  description:
    "مقایسه صادقانه سپیدار سیستم با هلو، پارمیس و سایر نرم‌افزارهای حسابداری ایرانی — امکانات، قیمت و مناسب چه کسب‌وکاری.",
  alternates: { canonical: "/compare" },
};

export default async function ComparisonIndexPage() {
  const pages = await publishedPages("comparison");

  return (
    <>
      <Breadcrumbs trail={[{ name: "مقایسه‌ها", href: "/compare" }]} />

      <Section className="pt-8">
        <SectionHeading
          as="h1"
          align="start"
          eyebrow="مقایسه"
          title="سپیدار در برابر بقیه"
          description="ما نماینده سپیداریم، ولی مقایسه‌ها را واقعی نوشته‌ایم. اگر نرم‌افزار دیگری برای کسب‌وکار شما مناسب‌تر است، بهتر است قبل از خرید بدانید."
        />

        {pages.length === 0 ? (
          <div className="mt-10 rounded-card border border-dashed border-ink-300 bg-white px-6 py-12 text-center">
            <p className="text-sm font-bold text-ink-500">هنوز مقایسه‌ای منتشر نشده</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-loose text-ink-500">
              برای مقایسه سپیدار با نرم‌افزاری که در نظر دارید، با ما تماس بگیرید.
            </p>
            <ButtonLink href="/consultation" size="lg" className="mt-6">
              پرسیدن از کارشناس
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <Link
                key={page.slug}
                href={`/compare/${page.slug}`}
                className="group flex flex-col rounded-card border border-ink-200 bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
              >
                <span className="w-fit rounded-lg bg-brand-50 px-2.5 py-1 text-[0.7rem] font-bold text-brand-700">
                  مقایسه
                </span>
                <h2 className="mt-4 text-base font-extrabold text-ink-900 transition-colors group-hover:text-brand-700">
                  سپیدار در برابر {page.competitor}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-loose text-ink-600">
                  {page.description}
                </p>
                <span className="mt-4 flex items-center gap-1.5 text-sm font-bold text-brand-700">
                  مشاهده مقایسه
                  <svg
                    aria-hidden
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="transition-transform group-hover:-translate-x-1"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
