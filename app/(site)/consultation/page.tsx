import type { Metadata } from "next";
import { site } from "@/lib/site";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "مشاوره رایگان انتخاب نرم‌افزار",
  description:
    "مشاوره رایگان انتخاب نسخه مناسب سپیدار برای کسب‌وکار شما. نوع فعالیت و تعداد کاربر را بگویید تا بسته درست و هزینه واقعی را مشخص کنیم.",
  alternates: { canonical: "/consultation" },
};

const steps = [
  { title: "می‌گویید کارتان چیست", body: "نوع فعالیت، تعداد کاربر و مشکلی که الان دارید." },
  { title: "بسته را پیشنهاد می‌دهیم", body: "نسخه مناسب، ماژول‌های لازم و هزینه واقعی — بدون فروش اضافه." },
  { title: "راه‌اندازی می‌کنیم", body: "نصب، انتقال اطلاعات قبلی، آموزش تیم و تنظیم سامانه مودیان." },
];

export default function ConsultationPage() {
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

        <ol className="mt-12 grid gap-5 sm:grid-cols-3">
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

      <Container>
        <div className="rounded-card border border-dashed border-ink-300 bg-white px-6 py-12 text-center">
          <p className="text-sm font-bold text-ink-500">فرم درخواست مشاوره و رزرو زمان تماس</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-loose text-ink-500">
            این بخش در فاز ۲ ساخته می‌شود: فرم کوتاه، دکمه واتساپ و تقویم رزرو زمان تماس. فعلاً از
            طریق تلفن در خدمت شما هستیم.
          </p>
          <a
            href={site.contact.primary.href}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3.5 text-base font-bold text-white shadow-soft transition-colors hover:bg-brand-800"
          >
            تماس با <span className="ltr tnum">{site.contact.primary.label}</span>
          </a>
        </div>
      </Container>
    </>
  );
}
