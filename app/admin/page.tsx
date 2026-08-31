import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getAllPricing, type Pricing } from "@/lib/pricing";
import { recentOrders } from "@/lib/orders";
import { recentLeads, hotLeads, upcomingBookings } from "@/lib/leads";
import { allPagesForAdmin } from "@/lib/landing";
import { allPostsForAdmin } from "@/lib/blog";
import { productsSorted } from "@/lib/products";
import { getHealth } from "@/lib/health";
import { formatNumber, formatPrice } from "@/lib/format";
import { formatSlotFull } from "@/lib/availability";
import { scoreLabel } from "@/lib/tracking";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

/**
 * داشبورد پنل.
 *
 * ترتیب عمدی است: اول کاری که باید انجام شود (سرنخ داغ، تماس رزروشده)،
 * بعد عددها. کسی که صبح پنل را باز می‌کند باید در سه ثانیه بداند
 * امروز باید با چه کسی تماس بگیرد.
 */
export default async function AdminHome() {
  const user = await currentUser();
  if (!user) redirect("/admin/login");

  const [pricing, orders, leads, hot, bookings, pages, posts, health] = await Promise.all([
    getAllPricing().catch((): Record<string, Pricing> => ({})),
    recentOrders(100).catch(() => []),
    recentLeads(200).catch(() => []),
    hotLeads().catch(() => []),
    upcomingBookings().catch(() => []),
    allPagesForAdmin().catch(() => []),
    allPostsForAdmin().catch(() => []),
    getHealth(),
  ]);

  const newLeads = leads.filter((l) => l.status === "new").length;
  const paidOrders = orders.filter((o) => o.status === "paid");
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const revenue = paidOrders.reduce((sum, o) => sum + o.amount_toman, 0);
  const pricedCount = productsSorted.filter((p) => pricing[p.slug]?.price_toman).length;

  const stats = [
    { label: "سرنخ پیگیری‌نشده", value: formatNumber(newLeads), href: "/admin/leads" },
    { label: "تماس رزروشده", value: formatNumber(bookings.length), href: "/admin/leads" },
    { label: "پرداخت موفق", value: formatNumber(paidOrders.length), href: "/admin/orders" },
    { label: "پرداخت ناتمام", value: formatNumber(pendingOrders), href: "/admin/orders" },
  ];

  const content = [
    {
      label: "بسته قیمت‌دار",
      value: `${formatNumber(pricedCount)} از ${formatNumber(productsSorted.length)}`,
      href: "/admin/prices",
    },
    {
      label: "لندینگ منتشرشده",
      value: formatNumber(pages.filter((p) => p.published).length),
      href: "/admin/landing",
    },
    {
      label: "مقاله منتشرشده",
      value: formatNumber(posts.filter((p) => p.published).length),
      href: "/admin/blog",
    },
    { label: "فروش کل", value: revenue > 0 ? formatPrice(revenue) : "—", href: "/admin/orders" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">
            سلام {user.display_name || user.username}
          </h1>
          <p className="mt-1 text-sm text-ink-500">خلاصه امروز</p>
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

      {/* ---------- هشدار راه‌اندازی ---------- */}
      {health.blockingCount > 0 && (
        <Link
          href="/admin/settings"
          className="mt-5 flex flex-wrap items-center gap-3 rounded-card border border-red-200 bg-red-50 px-5 py-4 transition-colors hover:border-red-300"
        >
          <span className="text-sm font-bold text-red-800">
            {formatNumber(health.blockingCount)} مورد تا آماده‌شدن سایت باقی مانده
          </span>
          <span className="ms-auto text-xs font-bold text-red-700">مشاهده فهرست ←</span>
        </Link>
      )}

      {/* ---------- کاری که امروز باید کرد ---------- */}
      {(hot.length > 0 || bookings.length > 0) && (
        <section className="mt-8">
          <h2 className="text-base font-extrabold text-ink-900">امروز با این‌ها تماس بگیرید</h2>

          {bookings.length > 0 && (
            <ul className="mt-3 space-y-2">
              {bookings.slice(0, 5).map((b) => (
                <li
                  key={b.public_id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3"
                >
                  <span className="rounded-md bg-brand-700 px-2 py-1 text-[0.7rem] font-bold text-white">
                    رزرو شده
                  </span>
                  <span className="text-sm font-extrabold text-brand-800">
                    {formatSlotFull(b.preferred_slot!)}
                  </span>
                  <span className="text-sm text-ink-700">{b.name}</span>
                  <a href={`tel:${b.phone}`} className="ltr tnum text-sm font-bold text-ink-900">
                    {b.phone}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {hot.length > 0 && (
            <ul className="mt-2 space-y-2">
              {hot.slice(0, 5).map((lead) => {
                const { label } = scoreLabel(lead.score);
                return (
                  <li
                    key={lead.public_id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-accent-400 bg-accent-100 px-4 py-3"
                  >
                    <span className="rounded-md bg-white px-2 py-1 text-[0.7rem] font-bold text-accent-600">
                      {label} · {formatNumber(lead.score)}
                    </span>
                    <span className="text-sm font-bold text-ink-900">
                      {lead.name ?? "بدون نام"}
                    </span>
                    <a href={`tel:${lead.phone}`} className="ltr tnum text-sm font-bold text-ink-900">
                      {lead.phone}
                    </a>
                    {!lead.is_complete && (
                      <span className="text-[0.7rem] font-bold text-ink-600">فرم نیمه‌کاره</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/admin/leads"
            className="mt-3 inline-block text-xs font-bold text-brand-700 hover:underline"
          >
            همه سرنخ‌ها ←
          </Link>
        </section>
      )}

      {/* ---------- عددها ---------- */}
      <section className="mt-8">
        <h2 className="text-base font-extrabold text-ink-900">فروش</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </dl>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-extrabold text-ink-900">محتوا</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {content.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </dl>
      </section>

      {/* ---------- میان‌برها ---------- */}
      <section className="mt-8">
        <h2 className="text-base font-extrabold text-ink-900">کارهای روزمره</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Shortcut
            href="/admin/prices"
            title="ویرایش قیمت‌ها"
            body="قیمت هر بسته — بدون دیپلوی مجدد روی سایت می‌نشیند"
          />
          <Shortcut
            href="/admin/leads"
            title="سرنخ‌ها"
            body="درخواست‌های مشاوره، امتیاز رفتاری و پیگیری"
          />
          <Shortcut href="/admin/orders" title="سفارش‌ها" body="وضعیت پرداخت و اطلاعات خریدار" />
          <Shortcut href="/admin/blog/new" title="مقاله جدید" body="نوشتن و انتشار مقاله وبلاگ" />
          <Shortcut
            href="/admin/landing/new"
            title="لندینگ‌پیج جدید"
            body="صفحه صنف + منطقه یا مقایسه با رقیب"
          />
          <Shortcut
            href="/admin/settings"
            title="تنظیمات"
            body="وضعیت راه‌اندازی، رمز عبور و کاربران"
          />
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-card border border-ink-200 bg-white p-5 transition-colors hover:border-brand-400"
    >
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className="tnum mt-1.5 text-lg font-extrabold text-ink-900">{value}</dd>
    </Link>
  );
}

function Shortcut({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link
      href={href}
      className="rounded-card border border-ink-200 bg-white p-5 transition-colors hover:border-brand-400"
    >
      <p className="text-sm font-extrabold text-ink-900">{title}</p>
      <p className="mt-1 text-xs leading-loose text-ink-500">{body}</p>
    </Link>
  );
}

/** نشان وضعیت سفارش — در صفحه سفارش‌ها هم استفاده می‌شود */
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
