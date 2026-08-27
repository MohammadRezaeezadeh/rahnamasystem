import type { Metadata } from "next";
import { site } from "@/lib/site";
import { productsSorted } from "@/lib/products";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { ProductCard } from "@/components/site/ProductCard";
import { HeroArt } from "@/components/site/HeroArt";
import { formatNumber } from "@/lib/format";
import { JsonLd } from "@/components/site/JsonLd";
import { faqSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: `${site.name} | ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
};

const trustPoints = [
  {
    title: "اولین نماینده در خراسان",
    body: "قرارداد، لایسنس و پشتیبانی مستقیم از همکاران سیستم — نه واسطه.",
  },
  {
    title: "دفتر در شهرک صنعتی توس",
    body: "حاشیه بلوار صنعت. نصب و آموزش حضوری برای کسب‌وکارهای منطقه.",
  },
  {
    title: "سامانه مودیان",
    body: "راه‌اندازی و تنظیم ارسال صورتحساب الکترونیکی، بدون دردسر.",
  },
  {
    title: "دو روش پرداخت",
    body: "پرداخت نقدی از طریق زرین‌پال، یا خرید قسطی با اسنپ‌پی.",
  },
];

const faqs = [
  {
    question: "چطور بفهمم کدام نسخه سپیدار مناسب کسب‌وکار من است؟",
    answer:
      "نوع فعالیت شما تعیین‌کننده است: تولیدی، بازرگانی، خدماتی، پیمانکاری یا پخش. اگر مطمئن نیستید، در یک تماس کوتاه بررسی می‌کنیم و نسخه مناسب را پیشنهاد می‌دهیم — این مشاوره رایگان است.",
  },
  {
    question: "قیمت نرم‌افزار سپیدار چقدر است؟",
    answer:
      "قیمت به نسخه انتخابی، تعداد کاربر و ماژول‌های جانبی بستگی دارد. قیمت به‌روز هر بسته در صفحه همان محصول درج شده است.",
  },
  {
    question: "آیا سپیدار با سامانه مودیان کار می‌کند؟",
    answer:
      "بله. تمام نسخه‌های سپیدار امکان ارسال صورتحساب به سامانه مودیان را دارند. راه‌اندازی و تنظیمات اولیه را ما انجام می‌دهیم.",
  },
  {
    question: "پشتیبانی بعد از خرید چگونه است؟",
    answer:
      "پشتیبانی تلفنی، ریموت و در صورت نیاز حضوری در مشهد ارائه می‌شود. برای مشتریان شهرک صنعتی توس امکان مراجعه در محل وجود دارد.",
  },
];


/** سه عدد اعتبارسنجی زیر CTAهای هیرو */
const credentials = [
  {
    value: `${formatNumber(site.credentials.yearsOfExperience)}+`,
    suffix: "",
    label: "سال سابقه پیاده‌سازی",
  },
  { value: formatNumber(1), suffix: "", label: "اولین نماینده در خراسان" },
  { value: formatNumber(7), suffix: "", label: "نسخه تخصصی سپیدار و دشت" },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />

      {/* ---------- هیرو ---------- */}
      <section className="relative overflow-hidden border-b border-ink-200 bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 start-1/4 size-[36rem] rounded-full bg-brand-100/50 blur-3xl"
        />
        <Container className="relative py-14 sm:py-20">
          {/* دو ستون فقط در دسکتاپ. ستون دوم صرفاً گرافیک برندی است و در موبایل
              حذف می‌شود، پس چیزی زیر متن اضافه نمی‌شود. */}
          <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-700">
                <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
                اولین نماینده سپیدار در خراسان
              </p>

              <h1 className="mt-6 text-3xl font-extrabold leading-[1.45] text-ink-900 sm:text-5xl sm:leading-[1.35]">
                نرم‌افزار حسابداری سپیدار،
                <br />
                <span className="text-brand-700">با انتخاب درست و راه‌اندازی درست.</span>
              </h1>

              <p className="mt-6 text-base leading-loose text-ink-600 sm:text-lg">
                هفت نسخه تخصصی سپیدار و دشت برای تولیدی، بازرگانی، خدماتی، پیمانکاری و پخش. با بیش
                از ۳۰ سال سابقه پیاده‌سازی، کمک می‌کنیم بسته درست را انتخاب کنید، نصب و آموزش بدهیم
                و بعدش هم کنارتان بمانیم.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/products" size="lg">
                  مشاهده محصولات و قیمت‌ها
                </ButtonLink>
                <ButtonLink href="/consultation" variant="secondary" size="lg">
                  مشاوره رایگان انتخاب بسته
                </ButtonLink>
              </div>

              {/* اعتبارسنجی به‌صورت یک ردیف متنی باریک — نه کارت جداگانه */}
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-5 border-t border-ink-200 pt-7">
                {credentials.map((c) => (
                  <div key={c.label} className="flex flex-col-reverse">
                    <dt className="mt-1 text-xs leading-relaxed text-ink-500">{c.label}</dt>
                    <dd className="text-2xl font-extrabold text-brand-700 sm:text-3xl">
                      {c.value}
                      {c.suffix && <span className="text-base"> {c.suffix}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <HeroArt />
          </div>
        </Container>
      </section>

      {/* ---------- محصولات ---------- */}
      <Section>
        <SectionHeading
          eyebrow="محصولات"
          title="کدام نسخه سپیدار برای شما ساخته شده؟"
          description="هر نسخه برای یک نوع کسب‌وکار طراحی شده. روی کارت مربوط به فعالیت خودتان بزنید تا جزئیات، قیمت و امکانات را ببینید."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {productsSorted.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </Section>

      {/* ---------- چرا ما ---------- */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="چرا رهنما سیستم شرق"
            title="فروشنده نرم‌افزار زیاد است، شریک راه‌اندازی کم"
            description="خرید لایسنس ده دقیقه طول می‌کشد. چیزی که کسب‌وکار شما را جلو می‌برد، درست راه‌افتادن نرم‌افزار است."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trustPoints.map((point) => (
              <div key={point.title} className="rounded-card border border-ink-200 bg-ink-50 p-6">
                <h3 className="text-base font-bold text-ink-900">{point.title}</h3>
                <p className="mt-2 text-sm leading-loose text-ink-600">{point.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- سؤالات متداول ---------- */}
      <Section>
        <SectionHeading eyebrow="سؤالات متداول" title="چیزهایی که معمولاً از ما می‌پرسند" />

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-ink-200 rounded-card border border-ink-200 bg-white">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-start font-bold text-ink-900">
                {faq.question}
                <svg
                  aria-hidden
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="shrink-0 text-ink-400 transition-transform group-open:rotate-180"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <p className="mt-3 text-sm leading-loose text-ink-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* ---------- فراخوان پایانی ---------- */}
      <Container>
        <div className="rounded-card bg-brand-800 px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            مطمئن نیستید کدام بسته را بگیرید؟
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-loose text-brand-100">
            نوع کسب‌وکارتان را بگویید؛ در یک تماس کوتاه نسخه مناسب، تعداد کاربر و هزینه واقعی را
            برایتان روشن می‌کنیم. بدون تعهد خرید.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/consultation" variant="secondary" size="lg">
              درخواست مشاوره
            </ButtonLink>
            <a
              href={site.contact.primary.href}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-500 px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-brand-700"
            >
              تماس مستقیم: <span className="ltr tnum">{site.contact.primary.label}</span>
            </a>
          </div>
        </div>
      </Container>
    </>
  );
}
