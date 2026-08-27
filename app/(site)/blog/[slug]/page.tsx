import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPost, publishedPosts, relatedPosts } from "@/lib/blog";
import { getCategory, isValidPostSlug } from "@/lib/blog-content";
import { getProduct } from "@/lib/products";
import { site } from "@/lib/site";
import { formatDateFa, formatNumber } from "@/lib/format";
import { Container, Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/site/JsonLd";
import { ArticleBody } from "@/components/site/ArticleBody";
import { PostCard } from "@/components/site/PostCard";
import { ProductCard } from "@/components/site/ProductCard";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { articleSchema } from "@/lib/schema";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await publishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidPostSlug(slug)) return {};

  const post = await getPublishedPost(slug);
  if (!post) return {};

  return {
    title: { absolute: `${post.title} | ${site.name}` },
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${site.url}/blog/${post.slug}`,
      publishedTime: post.published_at ?? undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  if (!isValidPostSlug(slug)) notFound();

  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const category = getCategory(post.category);
  const related = await relatedPosts(post);
  const products = post.related_products
    .map((s) => getProduct(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <JsonLd data={articleSchema(post)} />

      <Breadcrumbs
        trail={[
          { name: "وبلاگ", href: "/blog" },
          ...(category
            ? [{ name: category.label, href: `/blog/category/${category.slug}` }]
            : []),
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
      />

      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.7fr_1fr] lg:gap-14">
          {/* ---------- مقاله ---------- */}
          <article className="min-w-0">
            {category && (
              <Link
                href={`/blog/category/${category.slug}`}
                className="inline-flex rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100"
              >
                {category.label}
              </Link>
            )}

            <h1 className="mt-4 text-2xl font-extrabold leading-[1.5] text-ink-900 sm:text-3xl sm:leading-[1.45]">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-500">
              {post.published_at && (
                <time dateTime={post.published_at}>{formatDateFa(post.published_at)}</time>
              )}
              <span aria-hidden>·</span>
              <span>{formatNumber(post.reading_minutes)} دقیقه مطالعه</span>
            </div>

            <p className="mt-6 border-s-4 border-ink-200 ps-4 text-sm leading-loose text-ink-600 sm:text-base">
              {post.excerpt}
            </p>

            <ArticleBody body={post.body} />

            {/* لینک داخلی اجباری به محصول — الزام سئویی فاز ۴ */}
            {products.length > 0 && (
              <section className="mt-12 rounded-card border border-brand-200 bg-brand-50 p-6">
                <h2 className="text-base font-extrabold text-ink-900">
                  نرم‌افزار مرتبط با این مقاله
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {products.map((product) => (
                    <li key={product.slug}>
                      <Link
                        href={`/products/${product.slug}`}
                        className="flex items-center gap-2 text-sm font-bold text-brand-800 hover:text-brand-900"
                      >
                        <svg
                          aria-hidden
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        {product.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          {/* ---------- ستون کناری ---------- */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-ink-200 bg-white p-6">
              <h2 className="text-sm font-extrabold text-ink-900">سؤالی برایتان پیش آمد؟</h2>
              <p className="mt-2 text-xs leading-loose text-ink-600">
                در ساعات کاری معمولاً چند دقیقه‌ای پاسخ می‌دهیم.
              </p>
              <div className="mt-5 space-y-2.5">
                <WhatsAppButton message={`سلام، درباره «${post.title}» سؤال داشتم.`} />
                <ButtonLink href="/consultation" variant="secondary" className="w-full">
                  مشاوره رایگان
                </ButtonLink>
              </div>
            </div>

            {products.length > 0 && (
              <div className="rounded-card border border-ink-200 bg-ink-50 p-6">
                <h2 className="text-sm font-extrabold text-ink-900">قیمت و امکانات</h2>
                <ul className="mt-3 space-y-2">
                  {products.map((product) => (
                    <li key={product.slug}>
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-xs font-semibold text-ink-700 hover:text-brand-700"
                      >
                        {product.shortName} ←
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Container>

      {/* ---------- مقالات مرتبط ---------- */}
      {related.length > 0 && (
        <Section className="border-t border-ink-200">
          <h2 className="text-lg font-extrabold text-ink-900">مطالب مرتبط</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </Section>
      )}

      {/* ---------- محصولات ---------- */}
      {products.length > 0 && (
        <Container className="pb-16">
          <h2 className="text-lg font-extrabold text-ink-900">نسخه‌های سپیدار</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </Container>
      )}
    </>
  );
}
