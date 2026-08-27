import Link from "next/link";
import { getProduct } from "@/lib/products";
import { parseArticle, parseInline, type Block } from "@/lib/blog-content";

/**
 * رندر متن مقاله.
 *
 * ورودی فقط متن ساده است و به بلوک‌های تایپ‌شده تبدیل می‌شود — هیچ HTML
 * خامی از دیتابیس داخل صفحه نمی‌رود، پس نویسنده حتی به‌اشتباه هم نمی‌تواند
 * اسکریپت تزریق کند.
 */

/** یک پاراگراف با لینک‌های داخلی به صفحات محصول */
function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((piece, i) => {
        if (piece.type === "text") return <span key={i}>{piece.text}</span>;

        // اگر اسلاگ اشتباه باشد، متن ساده نمایش داده می‌شود نه لینک شکسته
        const product = getProduct(piece.slug);
        if (!product) return <span key={i}>{piece.text}</span>;

        return (
          <Link
            key={i}
            href={`/products/${product.slug}`}
            className="font-bold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:decoration-brand-600"
          >
            {piece.text}
          </Link>
        );
      })}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="mt-10 text-lg font-extrabold text-ink-900 sm:text-xl">{block.text}</h2>
      );

    case "paragraph":
      return (
        <p className="mt-4 text-sm leading-loose text-ink-700 sm:text-base">
          <Inline text={block.text} />
        </p>
      );

    case "list":
      return (
        <ul className="mt-4 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-loose text-ink-700">
              <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-600" />
              <span>
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ul>
      );

    case "quote":
      return (
        <blockquote className="mt-6 rounded-card border-s-4 border-brand-500 bg-brand-50 px-5 py-4 text-sm font-semibold leading-loose text-ink-800">
          <Inline text={block.text} />
        </blockquote>
      );
  }
}

export function ArticleBody({ body }: { body: string }) {
  const blocks = parseArticle(body);
  return (
    <div>
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}
