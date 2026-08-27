import type { Metadata } from "next";
import Link from "next/link";
import { publishedPosts, countByCategory } from "@/lib/blog";
import { CATEGORIES } from "@/lib/blog-content";
import { formatNumber } from "@/lib/format";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { PostCard } from "@/components/site/PostCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "وبلاگ و آموزش",
  description:
    "مقالات آموزشی درباره سامانه مودیان، انتخاب نرم‌افزار حسابداری، آموزش عملیاتی سپیدار و نکات مالیاتی کسب‌وکارهای مشهد.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const [posts, counts] = await Promise.all([publishedPosts(), countByCategory()]);
  const [featured, ...rest] = posts;

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

        {/* ---------- دسته‌بندی‌ها ---------- */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/blog/category/${category.slug}`}
              className="group rounded-card border border-ink-200 bg-white p-5 transition-colors hover:border-brand-400"
            >
              <h2 className="text-sm font-extrabold text-ink-900 transition-colors group-hover:text-brand-700">
                {category.label}
              </h2>
              <p className="mt-2 text-xs leading-loose text-ink-600">{category.description}</p>
              <p className="mt-3 text-[0.7rem] font-bold text-ink-400">
                {counts[category.slug]
                  ? `${formatNumber(counts[category.slug])} مقاله`
                  : "به‌زودی"}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      {posts.length === 0 ? (
        <Container className="pb-16">
          <div className="rounded-card border border-dashed border-ink-300 bg-white px-6 py-12 text-center">
            <p className="text-sm font-bold text-ink-500">هنوز مقاله‌ای منتشر نشده</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-loose text-ink-500">
              تا انتشار اولین مقالات، برای هر سؤالی می‌توانید مستقیم با ما تماس بگیرید.
            </p>
            <ButtonLink href="/consultation" size="lg" className="mt-6">
              پرسیدن سؤال از کارشناس
            </ButtonLink>
          </div>
        </Container>
      ) : (
        <Container className="pb-16">
          <h2 className="text-lg font-extrabold text-ink-900">تازه‌ترین مقالات</h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured && <PostCard post={featured} />}
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </Container>
      )}
    </>
  );
}
