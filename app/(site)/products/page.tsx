import type { Metadata } from "next";
import { productsSorted } from "@/lib/products";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { ProductCard } from "@/components/site/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "محصولات سپیدار سیستم و دشت",
  description:
    "فهرست کامل نسخه‌های سپیدار سیستم — تولیدی، بازرگانی، خدماتی، پیمانکاری، پخش و مویرگی — به‌همراه دشت و سپیدار ابری. امکانات، مناسب چه کسب‌وکاری و قیمت به‌روز.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: "محصولات", href: "/products" }]} />

      <Section className="pt-8">
        <SectionHeading
          as="h1"
          align="start"
          eyebrow="محصولات"
          title="هفت نسخه، هر کدام برای یک نوع کسب‌وکار"
          description="سپیدار یک نرم‌افزار واحد نیست؛ هر نسخه امکانات مخصوص یک صنف را دارد. نسخه‌ای که با فعالیت شما جور باشد، هم ارزان‌تر تمام می‌شود هم سریع‌تر راه می‌افتد."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {productsSorted.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </Section>

      <Container>
        <div className="rounded-card border border-brand-200 bg-brand-50 px-6 py-10 text-center sm:px-10">
          <h2 className="text-xl font-extrabold text-ink-900 sm:text-2xl">
            هنوز مطمئن نیستید کدام یکی؟
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-loose text-ink-600">
            بگویید کارتان چیست و چند نفر با نرم‌افزار کار می‌کنند؛ نسخه مناسب و هزینه واقعی را
            برایتان مشخص می‌کنیم.
          </p>
          <ButtonLink href="/consultation" size="lg" className="mt-6">
            مشاوره رایگان بگیرید
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
