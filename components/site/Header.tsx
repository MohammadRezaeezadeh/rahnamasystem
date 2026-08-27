"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { mainNav } from "@/lib/nav";
import { site } from "@/lib/site";
import { Logo } from "./Logo";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // بستن منو هنگام کلیک روی لینک - به‌جای واکنش به تغییر pathname داخل useEffect
  const closeMenu = () => {
    setOpen(false);
    setExpanded(null);
  };

  // وقتی منوی تمام‌صفحه باز است، صفحه پشتش نباید اسکرول شود
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />

        {/* ناوبری دسکتاپ */}
        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="ناوبری اصلی">
          {mainNav.map((item) => (
            <div key={item.href} className="group relative">
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-brand-700"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                }`}
              >
                {item.label}
                {item.children && (
                  <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 opacity-60">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
              </Link>

              {item.children && (
                <div className="invisible absolute start-0 top-full z-10 w-72 translate-y-1 pt-2 opacity-0 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white p-2 shadow-lift">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-brand-50"
                      >
                        <span className="block text-sm font-semibold text-ink-900">{child.label}</span>
                        {child.description && (
                          <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">
                            {child.description}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* اقدام‌های سمت چپ - shrink-0 تا در موبایل فشرده نشود و لوگو کوتاه شود */}
        <div className="ms-auto flex shrink-0 items-center gap-2 lg:ms-0">
          <a
            href={site.contact.primary.href}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-100 sm:flex"
          >
            <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
            </svg>
            <span className="ltr tnum">{site.contact.primary.label}</span>
          </a>

          <Link
            href="/consultation"
            className="flex min-h-11 items-center whitespace-nowrap rounded-xl bg-brand-700 px-3 text-xs font-bold text-white shadow-soft transition-colors hover:bg-brand-800 sm:px-4 sm:text-sm"
          >
            مشاوره رایگان
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            className="grid size-11 place-items-center rounded-xl border border-ink-200 text-ink-700 lg:hidden"
          >
            <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* ناوبری موبایل */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="ناوبری موبایل"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-ink-200 bg-white px-4 pb-6 pt-3 lg:hidden"
        >
          {mainNav.map((item) => (
            <div key={item.href} className="border-b border-ink-100 last:border-0">
              <div className="flex items-center">
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex-1 py-3.5 text-base font-semibold ${
                    isActive(item.href) ? "text-brand-700" : "text-ink-800"
                  }`}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => (v === item.href ? null : item.href))}
                    aria-expanded={expanded === item.href}
                    aria-label={`زیرمنوی ${item.label}`}
                    className="grid size-10 place-items-center text-ink-500"
                  >
                    <svg
                      aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      className={`transition-transform ${expanded === item.href ? "rotate-180" : ""}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                )}
              </div>

              {item.children && expanded === item.href && (
                <ul className="pb-3 ps-3">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={closeMenu}
                        className="block border-s-2 border-ink-200 py-2.5 ps-3 text-sm text-ink-600"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <a
            href={site.contact.primary.href}
            onClick={closeMenu}
            className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-ink-200 py-3 font-bold text-ink-800"
          >
            تماس تلفنی: <span className="ltr tnum">{site.contact.primary.label}</span>
          </a>
        </nav>
      )}
    </header>
  );
}
