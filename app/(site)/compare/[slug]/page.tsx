import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPage, publishedPages, isValidSlug } from "@/lib/landing";
import { site } from "@/lib/site";
import { LandingTemplate } from "@/components/site/LandingTemplate";

/** صفحات مقایسه: /compare/sepidar-vs-holoo */

export const revalidate = 3600;

export async function generateStaticParams() {
  const pages = await publishedPages("comparison");
  return pages.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidSlug(slug)) return {};

  const page = await getPublishedPage(slug, "comparison");
  if (!page) return {};

  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: `/compare/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${site.url}/compare/${page.slug}`,
    },
  };
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();

  const page = await getPublishedPage(slug, "comparison");
  if (!page) notFound();

  return (
    <LandingTemplate
      page={page}
      trail={[
        { name: "مقایسه‌ها", href: "/compare" },
        { name: `سپیدار و ${page.competitor ?? ""}`.trim(), href: `/compare/${page.slug}` },
      ]}
    />
  );
}
