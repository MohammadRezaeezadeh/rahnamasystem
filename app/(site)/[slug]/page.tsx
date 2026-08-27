import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPage, publishedPages, isValidSlug } from "@/lib/landing";
import { site } from "@/lib/site";
import { LandingTemplate } from "@/components/site/LandingTemplate";

/**
 * لندینگ‌پیج صنفی در ریشه: /hesabdari-tolidi-mashhad
 *
 * مسیرهای ثابت سایت (/products، /blog، …) بر این مسیر پویا اولویت دارند،
 * پس تداخلی پیش نمی‌آید. RESERVED_SLUGS هم در پنل جلوی ثبت اسلاگ متداخل
 * را می‌گیرد.
 */

export const revalidate = 3600;

export async function generateStaticParams() {
  const pages = await publishedPages("industry");
  return pages.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidSlug(slug)) return {};

  const page = await getPublishedPage(slug, "industry");
  if (!page) return {};

  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${site.url}/${page.slug}`,
    },
  };
}

export default async function IndustryLandingPage({ params }: Props) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();

  const page = await getPublishedPage(slug, "industry");
  if (!page) notFound();

  return (
    <LandingTemplate
      page={page}
      trail={[{ name: page.industry ?? page.h1, href: `/${page.slug}` }]}
    />
  );
}
