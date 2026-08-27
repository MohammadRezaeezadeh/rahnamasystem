import type { Metadata } from "next";
import { site } from "@/lib/site";
import { productsSorted, getProduct } from "@/lib/products";
import { availableSlots } from "@/lib/availability";
import { bookedSlots } from "@/lib/leads";
import { isDatabaseConfigured } from "@/lib/db";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { ConsultationForm } from "./ConsultationForm";

/** زمان‌های آزاد با گذشت وقت عوض می‌شوند، پس این صفحه نباید کش شود */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مشاوره رایگان انتخاب نرم‌افزار",
  description:
    "مشاوره رایگان انتخاب نسخه مناسب سپیدار برای کسب‌وکار شما. فرم کوتاه پر کنید یا زمان تماس رزرو کنید — یا همین حالا در واتساپ بپرسید.",
  alternates: { canonical: "/consultation" },
};

const steps = [
  { title: "می‌گویید کارتان چیست", body: "نوع فعالیت، تعداد کاربر و مشکلی که الان دارید." },
  { title: "بسته را پیشنهاد می‌دهیم", body: "نسخه مناسب، ماژول‌های لازم و هزینه واقعی — بدون فروش اضافه." },
  { title: "راه‌اندازی می‌کنیم", body: "نصب، انتقال اطلاعات قبلی، آموزش تیم و تنظیم سامانه مودیان." },
];

type Props = { searchParams: Promise<{ product?: string }> };

export default async function ConsultationPage({ searchParams }: Props) {
  const { product } = await searchParams;
  const selected = product && getProduct(product) ? product : "";

  // اگر دیتابیس در دسترس نباشد، فرم باید همچنان نمایش داده شود —
  // فقط بدون امکان رزرو زمان.
  let days: Awaited<ReturnType<typeof availableSlots>> = [];
  if (isDatabaseConfigured()) {
    try {
      days = availableSlots(await bookedSlots());
    } catch (error) {
      console.error("خواندن زمان‌های رزروشده ناموفق بود:", error);
    }
  }

  const businessTypes = [
    ...productsSorted.map((p) => ({ value: p.slug, label: p.shortName })),
    { value: "other", label: "سایر" },
  ];

  return (
    <>
      <Breadcrumbs trail={[{ name: "مشاوره و دمو", href: "/consultation" }]} />

      <Section className="pt-8">
        <SectionHeading
          as="h1"
          align="start"
          eyebrow="مشاوره رایگان"
          title="قبل از خرید، مطمئن شوید درست انتخاب کرده‌اید"
          description="اشتباه رایج این است که کسب‌وکار نسخه‌ای گران‌تر از نیازش می‌خرد یا نسخه‌ای که امکانات صنف خودش را ندارد. یک تماس کوتاه جلوی هر دو را می‌گیرد."
        />

        <ol className="mt-10 grid gap-5 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-card border border-ink-200 bg-white p-6">
              <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-sm font-extrabold text-brand-700">
                {["۱", "۲", "۳"][i]}
              </span>
              <h2 className="mt-4 text-base font-bold text-ink-900">{step.title}</h2>
              <p className="mt-2 text-sm leading-loose text-ink-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Container className="pb-16">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
          {/* ---------- فرم ---------- */}
          <div className="min-w-0 rounded-card border border-ink-200 bg-white p-6 sm:p-8">
            <h2 className="text-lg font-extrabold text-ink-900">فرم درخواست مشاوره</h2>
            <p className="mt-1.5 text-sm text-ink-500">
              دو فیلد اجباری، کمتر از یک دقیقه.
            </p>

            <div className="mt-6">
              <ConsultationForm
                businessTypes={businessTypes}
                defaultProduct={selected}
                days={days}
              />
            </div>
          </div>

          {/* ---------- مسیرهای سریع‌تر ---------- */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-ink-200 bg-white p-6">
              <h2 className="text-sm font-extrabold text-ink-900">عجله دارید؟</h2>
              <p className="mt-2 text-xs leading-loose text-ink-600">
                سریع‌ترین راه، پیام در واتساپ است. معمولاً در ساعات کاری چند دقیقه‌ای پاسخ
                می‌دهیم.
              </p>

              <div className="mt-5 space-y-2.5">
                <WhatsAppButton message="سلام، برای انتخاب نسخه سپیدار مشاوره می‌خواستم." />
                <a
                  href={site.contact.primary.href}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-ink-200 px-5 text-sm font-bold text-ink-800 transition-colors hover:border-brand-400 hover:text-brand-700"
                >
                  <span className="ltr tnum">{site.contact.primary.label}</span>
                </a>
              </div>

              <p className="mt-5 border-t border-ink-200 pt-4 text-xs leading-loose text-ink-500">
                {site.openingHoursLabel}
              </p>
            </div>

            <div className="rounded-card border border-ink-200 bg-ink-50 p-6">
              <h2 className="text-sm font-extrabold text-ink-900">مشاوره واقعاً رایگان است؟</h2>
              <p className="mt-2 text-xs leading-loose text-ink-600">
                بله. اگر بعد از بررسی به این نتیجه برسیم که سپیدار به کارتان نمی‌آید، همان را
                می‌گوییم. فروش نسخه اشتباه برای ما هم هزینه پشتیبانی دارد.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
