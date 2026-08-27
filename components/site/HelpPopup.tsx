"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { POPUP_THRESHOLD, STORAGE } from "@/lib/tracking";
import { WhatsAppIcon } from "./WhatsAppButton";

/**
 * پاپ‌آپ «سؤالی داری؟»
 *
 * وقتی امتیاز رفتاری از آستانه رد شود یک‌بار نمایش داده می‌شود.
 * عمداً محدود شده تا آزاردهنده نباشد:
 *   - فقط یک‌بار در هر ۲۴ ساعت
 *   - نه در صفحه تسویه (کاربر وسط پرداخت است)
 *   - نه در پنل مدیریت
 *   - با Escape و کلیک بیرون بسته می‌شود
 */
export function HelpPopup({
  whatsappHref,
  phoneLabel,
  phoneHref,
}: {
  whatsappHref: string;
  phoneLabel: string;
  phoneHref: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // در مسیرهایی که مزاحمت ایجاد می‌کند اصلاً فعال نشود
    const path = window.location.pathname;
    if (path.startsWith("/checkout") || path.startsWith("/admin")) return;

    const alreadyShown = () => {
      try {
        const last = Number(window.localStorage.getItem(STORAGE.popupShown) ?? "0");
        return Date.now() - last < 24 * 60 * 60 * 1000;
      } catch {
        // بدون localStorage محتاطانه رفتار می‌کنیم و نشان نمی‌دهیم
        return true;
      }
    };

    const maybeOpen = (score: number) => {
      if (score < POPUP_THRESHOLD || alreadyShown()) return;
      try {
        window.localStorage.setItem(STORAGE.popupShown, String(Date.now()));
      } catch {
        /* اگر ذخیره نشد، بازهم یک‌بار در همین صفحه نشان داده می‌شود */
      }
      setOpen(true);
    };

    // امتیاز فعلی (مثلاً کاربر در بازدید قبلی امتیاز جمع کرده)
    const initial = window.rsScore?.() ?? 0;
    const timer = setTimeout(() => maybeOpen(initial), 4000);

    const onScore = (e: Event) => maybeOpen((e as CustomEvent<number>).detail);
    window.addEventListener("rs:score", onScore);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("rs:score", onScore);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="help-popup-title"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-card border border-ink-200 bg-white p-5 shadow-lift sm:inset-x-auto sm:end-6"
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="بستن"
        className="absolute end-3 top-3 grid size-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <h2 id="help-popup-title" className="pe-8 text-sm font-extrabold text-ink-900">
        سؤالی برایتان پیش آمده؟
      </h2>
      <p className="mt-2 text-xs leading-loose text-ink-600">
        اگر بین چند نسخه مانده‌اید یا قیمت دقیق می‌خواهید، یک پیام کوتاه کافی است. مشاوره
        رایگان است و تعهدی نمی‌آورد.
      </p>

      <div className="mt-4 space-y-2.5">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          data-analytics="whatsapp-click"
          onClick={() => setOpen(false)}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-bold text-white transition-colors hover:brightness-95"
        >
          <WhatsAppIcon size={16} />
          پرسیدن در واتساپ
        </a>

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/consultation"
            onClick={() => setOpen(false)}
            className="flex min-h-10 items-center justify-center rounded-xl border border-ink-200 px-3 text-xs font-bold text-ink-800 transition-colors hover:border-brand-400 hover:text-brand-700"
          >
            فرم مشاوره
          </Link>
          <a
            href={phoneHref}
            onClick={() => setOpen(false)}
            className="ltr tnum flex min-h-10 items-center justify-center rounded-xl border border-ink-200 px-3 text-xs font-bold text-ink-800 transition-colors hover:border-brand-400 hover:text-brand-700"
          >
            {phoneLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
