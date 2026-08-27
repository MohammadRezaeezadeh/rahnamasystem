import { Container } from "@/components/ui/Section";
import { SiteChrome } from "@/components/site/SiteChrome";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = {
  title: "صفحه پیدا نشد",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <SiteChrome>
      <Container className="py-24 text-center">
      <p className="text-5xl font-extrabold text-brand-700">۴۰۴</p>
      <h1 className="mt-6 text-2xl font-extrabold text-ink-900">این صفحه پیدا نشد</h1>
      <p className="mx-auto mt-4 max-w-md leading-loose text-ink-600">
        ممکن است آدرس را اشتباه وارد کرده باشید یا صفحه جابه‌جا شده باشد.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href="/" size="lg">
          بازگشت به صفحه اصلی
        </ButtonLink>
        <ButtonLink href="/products" variant="secondary" size="lg">
          مشاهده محصولات
        </ButtonLink>
      </div>
      </Container>
    </SiteChrome>
  );
}
