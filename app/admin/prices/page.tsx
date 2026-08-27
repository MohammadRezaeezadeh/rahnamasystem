import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { productsSorted } from "@/lib/products";
import { getAllPricing } from "@/lib/pricing";
import { isAnyProviderReady } from "@/lib/payments";
import { PriceForm } from "./PriceForm";

export const dynamic = "force-dynamic";

export default async function PricesPage() {
  if (!(await currentUser())) redirect("/admin/login");

  const pricing = await getAllPricing();
  const paymentReady = isAnyProviderReady();

  return (
    <>
      <h1 className="text-xl font-extrabold text-ink-900">قیمت محصولات</h1>
      <p className="mt-2 text-sm leading-loose text-ink-600">
        تغییرات بلافاصله روی سایت اعمال می‌شوند — نیازی به دیپلوی مجدد نیست. فیلد قیمت را خالی
        بگذارید تا روی سایت «استعلام قیمت» نمایش داده شود.
      </p>

      {!paymentReady && (
        <p className="mt-4 rounded-xl border border-accent-400 bg-accent-100 px-4 py-3 text-sm leading-loose text-ink-800">
          هیچ درگاه پرداختی هنوز پیکربندی نشده، پس حتی اگر «خرید آنلاین» را فعال کنید، روی سایت
          دکمه مشاوره نمایش داده می‌شود. بعد از دریافت کد پذیرندگی زرین‌پال این پیام می‌رود.
        </p>
      )}

      <div className="mt-6 space-y-4">
        {productsSorted.map((product) => (
          <PriceForm key={product.slug} product={product} pricing={pricing[product.slug] ?? null} />
        ))}
      </div>
    </>
  );
}
