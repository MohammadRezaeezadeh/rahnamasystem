import type { Metadata } from "next";
import { site, whatsappLink } from "@/lib/site";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: `آدرس، تلفن و ساعات کاری ${site.legalName} — ${site.address.city}، ${site.address.streetShort}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: "تماس با ما", href: "/contact" }]} />

      <Section className="pt-8">
        <SectionHeading
          as="h1"
          align="start"
          eyebrow="تماس"
          title="در دسترس‌ترین راه ارتباط با ما"
          description="برای استعلام قیمت، مشاوره انتخاب بسته یا پشتیبانی تماس بگیرید. شماره اصلی روی موبایل دایورت است، پس حتی خارج از ساعت اداری هم پاسخ داده می‌شود."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {/* --- تلفن‌ها --- */}
          <div className="rounded-card border border-ink-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-bold text-brand-700">تلفن</p>

            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-xs text-ink-500">شماره اصلی — همیشه در دسترس</dt>
                <dd>
                  <a
                    href={site.contact.primary.href}
                    className="ltr tnum text-lg font-extrabold text-ink-900 hover:text-brand-700"
                  >
                    {site.contact.primary.label}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="text-xs text-ink-500">دفتر شهرک صنعتی توس — ۵ خط</dt>
                <dd>
                  <a
                    href={site.contact.office.href}
                    className="ltr tnum text-base font-bold text-ink-900 hover:text-brand-700"
                  >
                    {site.contact.office.label}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="text-xs text-ink-500">همراه</dt>
                <dd className="mt-1 flex flex-col gap-1">
                  {site.contact.mobiles.map((m) => (
                    <a
                      key={m.href}
                      href={m.href}
                      className="ltr tnum text-base font-bold text-ink-900 hover:text-brand-700"
                    >
                      {m.label}
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          {/* --- واتساپ و ایمیل --- */}
          <div className="rounded-card border border-ink-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-bold text-brand-700">پیام</p>

            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 font-bold text-white transition-colors hover:bg-[#1da851]"
            >
              <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.6-.92-2.2-.24-.57-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.8h-.02a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.79 9.79 0 0 1-1.5-5.23c0-5.41 4.41-9.81 9.83-9.81 2.62 0 5.09 1.02 6.94 2.88a9.75 9.75 0 0 1 2.87 6.94c0 5.41-4.4 9.82-9.82 9.82M20.52 3.45A11.68 11.68 0 0 0 12.05 0C5.6 0 .35 5.25.34 11.7c0 2.06.54 4.08 1.56 5.85L.24 24l6.6-1.73a11.7 11.7 0 0 0 5.2 1.24h.01c6.45 0 11.7-5.25 11.7-11.7a11.6 11.6 0 0 0-3.43-8.31" />
              </svg>
              گفتگو در واتساپ
            </a>
            <p className="mt-2 text-center text-xs text-ink-500">
              <span className="ltr tnum">{site.contact.whatsappLabel}</span>
            </p>

            <div className="mt-6 border-t border-ink-200 pt-4">
              <p className="text-xs text-ink-500">ایمیل</p>
              <a
                href={`mailto:${site.contact.email}`}
                className="ltr text-sm font-bold text-ink-900 hover:text-brand-700"
              >
                {site.contact.email}
              </a>
            </div>
          </div>

          {/* --- آدرس --- */}
          <div className="rounded-card border border-ink-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-bold text-brand-700">آدرس دفتر</p>
            <address className="mt-4 text-sm font-semibold not-italic leading-loose text-ink-900">
              {site.address.city}، {site.address.street}
            </address>

            <div className="mt-5 border-t border-ink-200 pt-4">
              <p className="text-xs text-ink-500">نماینده</p>
              <p className="text-sm font-bold text-ink-900">{site.representative.name}</p>
            </div>

            <div className="mt-4 border-t border-ink-200 pt-4">
              <p className="text-xs text-ink-500">ساعات کاری</p>
              <p className="mt-1 text-sm leading-loose text-ink-700">{site.openingHoursLabel}</p>
            </div>
          </div>
        </div>
      </Section>

      <Container>
        <div className="rounded-card border border-brand-200 bg-brand-50 px-6 py-10 text-center sm:px-10">
          <h2 className="text-xl font-extrabold text-ink-900 sm:text-2xl">
            ترجیح می‌دهید ما تماس بگیریم؟
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-loose text-ink-600">
            شماره و نوع کسب‌وکارتان را ثبت کنید تا کارشناس ما در اولین فرصت تماس بگیرد.
          </p>
          <ButtonLink href="/consultation" size="lg" className="mt-6">
            درخواست مشاوره
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
