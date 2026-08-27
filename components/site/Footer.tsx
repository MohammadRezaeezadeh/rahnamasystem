import Link from "next/link";
import { site } from "@/lib/site";
import { footerNav } from "@/lib/nav";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          {/* معرفی + آدرس (همان داده‌ای که در LocalBusiness schema می‌رود) */}
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-md text-sm leading-loose text-ink-600">{site.description}</p>

            <address className="mt-5 space-y-2 text-sm not-italic text-ink-600">
              <p className="flex items-start gap-2">
                <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-1 shrink-0 text-brand-700">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{site.address.city}، {site.address.street}</span>
              </p>
              <p className="flex items-center gap-2">
                <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-brand-700">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
                </svg>
                <a href={site.contact.primary.href} className="ltr tnum inline-flex min-h-10 items-center font-semibold hover:text-brand-700">
                  {site.contact.primary.label}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-brand-700">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 6L2 7" />
                </svg>
                <a href={`mailto:${site.contact.email}`} className="ltr inline-flex min-h-10 items-center hover:text-brand-700">
                  {site.contact.email}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-brand-700">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span>{site.openingHoursLabel}</span>
              </p>
            </address>
          </div>

          {/* ستون‌های لینک - از lib/nav.ts ساخته می‌شوند */}
          {footerNav.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-sm font-bold text-ink-900">{col.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex min-h-10 items-center text-sm text-ink-600 transition-colors hover:text-brand-700">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-ink-200 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date())} {site.name} — همه حقوق محفوظ است.
          </p>
          <p>سپیدار سیستم و دشت، محصولات شرکت همکاران سیستم هستند.</p>
        </div>
      </div>
    </footer>
  );
}
