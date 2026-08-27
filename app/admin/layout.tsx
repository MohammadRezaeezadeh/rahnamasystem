import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/site/LogoMark";

export const metadata: Metadata = {
  title: "پنل مدیریت",
  robots: { index: false, follow: false },
};

/** پنل هرگز نباید کش شود */
export const dynamic = "force-dynamic";

const adminNav = [
  { href: "/admin", label: "خلاصه" },
  { href: "/admin/prices", label: "قیمت‌ها" },
  { href: "/admin/leads", label: "سرنخ‌ها" },
  { href: "/admin/orders", label: "سفارش‌ها" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-ink-100">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex min-h-14 max-w-5xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2">
          <Link href="/admin" className="flex items-center gap-2">
            <LogoMark className="h-6 w-auto" />
            <span className="text-sm font-extrabold text-ink-900">پنل مدیریت</span>
          </Link>

          <nav className="flex items-center gap-1" aria-label="ناوبری پنل">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="ms-auto whitespace-nowrap text-xs font-semibold text-ink-500 transition-colors hover:text-brand-700"
          >
            مشاهده سایت ←
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
