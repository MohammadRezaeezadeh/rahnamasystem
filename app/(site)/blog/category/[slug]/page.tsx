import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publishedPosts } from "@/lib/blog";
import { CATEGORIES, getCategory } from "@/lib/blog-content";
import { site } from "@/lib/site";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { PostCard } from "@/components/site/PostCard";

export const revalidate = 3600;

/** دسته‌ها ثابت‌اند، پس هر چهار صفحه در زمان build ساخته می‌شوند */
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};

  return {
    title: `${category.label} — وبلاگ`,
    description: category.description,
    alternates: { canonical: `/blog/category/${category.slug}` },
    openGraph: {
      title: `${category.label} | ${site.name}`,
      description: category.description,
      url: `${site.url}/blog/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const posts = await publishedPosts(category.slug);

  return (
    <>
      <Breadcrumbs
        trail={[
          { name: "وبلاگ", href: "/blog" },
          { name: category.label, href: `/blog/category/${category.slug}` },
        ]}
      />

      <Section className="pt-8">
        <SectionHeading
          as="h1"
          align="start"
          eyebrow="دسته‌بندی"
          title={category.label}
          description={category.description}
        />

        {posts.length === 0 ? (
          <div className="mt-10 rounded-card border border-dashed border-ink-300 bg-white px-6 py-12 text-center">
            <p className="text-sm font-bold text-ink-500">
              هنوز مقاله‌ای در این دسته منتشر نشده
            </p>
            <ButtonLink href="/blog" variant="secondary" size="lg" className="mt-6">
              مشاهده سایر دسته‌ها
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} showCategory={false} />
            ))}
          </div>
        )}
      </Section>

      {/* ---------- سایر دسته‌ها ---------- */}
      <Container className="pb-16">
        <h2 className="text-sm font-extrabold text-ink-900">سایر دسته‌ها</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.slug !== category.slug).map((c) => (
            <Link
              key={c.slug}
              href={`/blog/category/${c.slug}`}
              className="min-h-10 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-xs font-bold text-ink-700 transition-colors hover:border-brand-400 hover:text-brand-700"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
