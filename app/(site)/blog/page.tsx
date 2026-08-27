import type { Metadata } from "next";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "وبلاگ و آموزش",
  description:
    "مقالات آموزشی درباره سامانه مودیان، انتخاب نرم‌افزار حسابداری، آموزش عملیاتی سپیدار و نکات مالیاتی کسب‌وکارهای مشهد.",
  alternates: { canonical: "/blog" },
};

/** دسته‌بندی‌های محتوایی — در فاز ۴ به مقالات واقعی وصل می‌شوند */
const categories = [
  { title: "سامانه مودیان و مالیات", body: "تکالیف قانونی، ارسال صورتحساب و جریمه‌ها به زبان ساده." },
  { title: "راهنمای انتخاب بسته", body: "کدام نسخه سپیدار برای کدام کسب‌وکار، با مقایسه واقعی." },
  { title: "آموزش عملیاتی", body: "کار با سپیدار قدم‌به‌قدم: از ثبت فاکتور تا بستن سال مالی." },
  { title: "کسب‌وکار در مشهد", body: "نکات مالی و اداری مخصوص کسب‌وکارهای خراسان رضوی." },
];

export default function BlogPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: "وبلاگ", href: "/blog" }]} />

      <Section className="pt-8">
        <SectionHeading
          as="h1"
          align="start"
          eyebrow="وبلاگ"
          title="آموزش، نه تبلیغ"
          description="مطالبی که واقعاً به کار حسابدار و مدیر مالی می‌آید — درباره سامانه مودیان، انتخاب نرم‌افزار و کار روزمره با سپیدار."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {categories.map((c) => (
            <div key={c.title} className="rounded-card border border-ink-200 bg-white p-6">
              <h2 className="text-base font-bold text-ink-900">{c.title}</h2>
              <p className="mt-2 text-sm leading-loose text-ink-600">{c.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Container>
        <div className="rounded-card border border-dashed border-ink-300 bg-white px-6 py-12 text-center">
          <p className="text-sm font-bold text-ink-500">هنوز مقاله‌ای منتشر نشده</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-loose text-ink-500">
            بخش مقالات در فاز ۴ راه‌اندازی می‌شود. تا آن موقع، برای هر سؤالی می‌توانید مستقیم با ما
            تماس بگیرید.
          </p>
          <ButtonLink href="/consultation" size="lg" className="mt-6">
            پرسیدن سؤال از کارشناس
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
