import Link from "next/link";
import type { Product } from "@/lib/products";

const familyLabel: Record<Product["family"], string> = {
  sepidar: "سپیدار سیستم",
  dashtt: "دشت",
  cloud: "نسخه ابری",
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-card border border-ink-200 bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
    >
      <span className="w-fit rounded-lg bg-brand-50 px-2.5 py-1 text-[0.7rem] font-bold text-brand-700">
        {familyLabel[product.family]}
      </span>

      <h3 className="mt-4 text-lg font-extrabold text-ink-900 transition-colors group-hover:text-brand-700">
        {product.shortName}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-loose text-ink-600">{product.summary}</p>

      <ul className="mt-4 space-y-1.5">
        {product.highlights.slice(0, 3).map((h) => (
          <li key={h} className="flex items-start gap-2 text-xs text-ink-600">
            <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mt-1 shrink-0 text-brand-600">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {h}
          </li>
        ))}
      </ul>

      <span className="mt-5 flex items-center gap-1.5 text-sm font-bold text-brand-700">
        مشاهده جزئیات و قیمت
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="transition-transform group-hover:-translate-x-1">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </span>
    </Link>
  );
}
