import "server-only";
import { unstable_cache, updateTag, revalidatePath } from "next/cache";
import { query, isDatabaseConfigured } from "./db";
import { productsSorted, type Product } from "./products";

/**
 * قیمت و توضیحات محصولات.
 *
 * ساختار محصول از lib/products.ts می‌آید (کد)، و مقادیر قابل ویرایش از
 * دیتابیس (پنل مدیریت). اگر دیتابیس نباشد یا ردیفی وجود نداشته باشد،
 * صفحه با «استعلام قیمت» بالا می‌آید — سایت هرگز به‌خاطر دیتابیس نمی‌افتد.
 */

export const PRICING_TAG = "product-pricing";

export type Pricing = {
  slug: string;
  price_toman: number | null;
  description: string | null;
  price_note: string | null;
  purchasable: boolean;
};

export type ProductWithPricing = Product & { pricing: Pricing | null };

type Row = {
  slug: string;
  price_toman: string | null; // BIGINT از pg به صورت رشته می‌آید
  description: string | null;
  price_note: string | null;
  purchasable: boolean;
};

function toPricing(row: Row): Pricing {
  return {
    slug: row.slug,
    // BIGINT در pg رشته است؛ اگر مستقیم استفاده شود، مقایسه و محاسبه غلط می‌شود
    price_toman: row.price_toman === null ? null : Number(row.price_toman),
    description: row.description,
    price_note: row.price_note,
    purchasable: row.purchasable,
  };
}

/** نتیجه بین درخواست‌ها کش می‌شود و فقط با ذخیره در پنل باطل می‌شود */
const loadAll = unstable_cache(
  async (): Promise<Record<string, Pricing>> => {
    if (!isDatabaseConfigured()) return {};
    try {
      const rows = await query<Row>(
        "select slug, price_toman, description, price_note, purchasable from product_pricing",
      );
      return Object.fromEntries(rows.map((r) => [r.slug, toPricing(r)]));
    } catch (error) {
      // دیتابیس در دسترس نیست — صفحه باید همچنان بالا بیاید
      console.error("خواندن قیمت‌ها ناموفق بود:", error);
      return {};
    }
  },
  ["product-pricing-all"],
  { tags: [PRICING_TAG] },
);

export async function getAllPricing(): Promise<Record<string, Pricing>> {
  return loadAll();
}

export async function getPricing(slug: string): Promise<Pricing | null> {
  const all = await loadAll();
  return all[slug] ?? null;
}

/** محصولات به‌همراه قیمتشان — برای صفحه فهرست و صفحه اصلی */
export async function getProductsWithPricing(): Promise<ProductWithPricing[]> {
  const all = await loadAll();
  return productsSorted.map((p) => ({ ...p, pricing: all[p.slug] ?? null }));
}

/**
 * ذخیره قیمت یک محصول و باطل کردن کش.
 * همین باعث می‌شود تغییر قیمت بدون دیپلوی مجدد روی سایت بنشیند.
 */
export async function savePricing(input: {
  slug: string;
  price_toman: number | null;
  description: string | null;
  price_note: string | null;
  purchasable: boolean;
}): Promise<void> {
  await query(
    `insert into product_pricing (slug, price_toman, description, price_note, purchasable, updated_at)
     values ($1, $2, $3, $4, $5, now())
     on conflict (slug) do update set
       price_toman = excluded.price_toman,
       description = excluded.description,
       price_note  = excluded.price_note,
       purchasable = excluded.purchasable,
       updated_at  = now()`,
    [input.slug, input.price_toman, input.description, input.price_note, input.purchasable],
  );
  // updateTag کش را فوراً باطل می‌کند و «خواندن نوشته‌ی خود» می‌دهد،
  // یعنی مدیر بلافاصله بعد از ذخیره قیمت جدید را می‌بیند.
  updateTag(PRICING_TAG);
  // صفحات از پیش ساخته‌شده هم باید دوباره تولید شوند
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
}

/** آیا این محصول واقعاً قابل خرید آنلاین است؟ */
export function isBuyable(pricing: Pricing | null): pricing is Pricing & { price_toman: number } {
  return Boolean(pricing?.purchasable && pricing.price_toman && pricing.price_toman > 0);
}
