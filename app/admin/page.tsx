import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getAllPricing } from "@/lib/pricing";
import { recentOrders } from "@/lib/orders";
import { productsSorted } from "@/lib/products";
import { availableProviders } from "@/lib/payments";
import { formatNumber, formatPrice } from "@/lib/format";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const user = await currentUser();
  if (!user) redirect("/admin/login");

  const [pricing, orders] = await Promise.all([getAllPricing(), recentOrders(5)]);
  const providers = availableProviders();

  const priced = productsSorted.filter((p) => pricing[p.slug]?.price_toman).length;
  const buyable = productsSorted.filter((p) => pricing[p.slug]?.purchasable).length;
  const paidCount = orders.filter((o) => o.status === "paid").length;

  const stats = [
    { label: "بسته دارای قیمت", value: `${formatNumber(priced)} از ${formatNumber(productsSorted.length)}` },
    { label: "خرید آنلاین فعال", value: formatNumber(buyable) },
    { label: "درگاه فعال", value: providers.length ? providers.map((p) => p.label).join("، ") : "هیچ" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">
            سلام {user.display_name || user.username}
          </h1>
          <p className="mt-1 text-sm text-ink-500">خلاصه وضعیت سایت</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="min-h-10 rounded-xl border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-700 transition-colors hover:border-red-300 hover:text-red-700"
          >
            خروج
          </button>
        </form>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-card border border-ink-200 bg-white p-5">
            <dt className="text-xs text-ink-500">{s.label}</dt>
            <dd className="mt-1.5 text-lg font-extrabold text-ink-900">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 rounded-card border border-ink-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-ink-900">آخرین سفارش‌ها</h2>
          <Link href="/admin/orders" className="text-xs font-bold text-brand-700 hover:underline">
            همه سفارش‌ها ←
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">هنوز سفارشی ثبت نشده است.</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-200">
            {orders.map((o) => (
              <li key={o.public_id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <span className="text-sm font-bold text-ink-900">{o.product_name}</span>
                <span className="text-xs text-ink-500">{o.customer_name}</span>
                <span className="tnum ms-auto text-sm font-bold text-ink-800">
                  {formatPrice(o.amount_toman)}
                </span>
                <StatusPill status={o.status} />
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-ink-400">
          تعداد پرداخت موفق در این فهرست: {formatNumber(paidCount)}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/prices"
          className="rounded-card border border-ink-200 bg-white p-5 transition-colors hover:border-brand-400"
        >
          <p className="text-sm font-extrabold text-ink-900">ویرایش قیمت‌ها</p>
          <p className="mt-1 text-xs leading-loose text-ink-500">
            قیمت و توضیحات هر بسته — بدون دیپلوی مجدد
          </p>
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-card border border-ink-200 bg-white p-5 transition-colors hover:border-brand-400"
        >
          <p className="text-sm font-extrabold text-ink-900">سفارش‌ها</p>
          <p className="mt-1 text-xs leading-loose text-ink-500">وضعیت پرداخت و اطلاعات تماس خریدار</p>
        </Link>
      </div>
    </>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: "پرداخت شد", cls: "bg-brand-100 text-brand-800" },
    pending: { label: "در انتظار", cls: "bg-accent-100 text-accent-600" },
    failed: { label: "ناموفق", cls: "bg-red-50 text-red-700" },
    canceled: { label: "لغو شد", cls: "bg-ink-100 text-ink-600" },
  };
  const s = map[status] ?? { label: status, cls: "bg-ink-100 text-ink-600" };
  return <span className={`rounded-md px-2 py-1 text-[0.7rem] font-bold ${s.cls}`}>{s.label}</span>;
}
