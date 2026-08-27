"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  TRACK_EVENTS,
  SCORE_WEIGHTS,
  DWELL_SECONDS,
  STORAGE,
  type TrackEvent,
} from "@/lib/tracking";

/**
 * ردیاب رفتار.
 *
 * امتیاز در localStorage نگه داشته می‌شود، پس بین صفحات و حتی بین
 * بازدیدها باقی می‌ماند. هیچ چیزی به سرور فرستاده نمی‌شود مگر وقتی کاربر
 * خودش فرمی را شروع کند — تا آن لحظه همه‌چیز فقط در مرورگر خودش است.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    rsTrack?: (event: TrackEvent, payload?: Record<string, unknown>) => void;
    rsScore?: () => number;
  }
}

/** localStorage در حالت ناشناس یا با تنظیمات سخت‌گیرانه خطا می‌دهد */
function readStorage(key: string, fallback = ""): string {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* بدون حافظه هم سایت باید کار کند */
  }
}

export function BehaviorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // ---- ابزار ردیابی سراسری ----
    const track = (event: TrackEvent, payload: Record<string, unknown> = {}) => {
      // ۱. به dataLayer برای GTM (اگر بود)
      window.dataLayer = window.dataLayer ?? [];
      window.dataLayer.push({ event, ...payload });

      // ۲. امتیازدهی مستقل از GTM
      const current = Number(readStorage(STORAGE.score, "0")) || 0;
      const next = current + (SCORE_WEIGHTS[event] ?? 0);
      writeStorage(STORAGE.score, String(next));

      // ۳. اطلاع به پاپ‌آپ بدون رفرش
      window.dispatchEvent(new CustomEvent("rs:score", { detail: next }));
    };

    window.rsTrack = track;
    window.rsScore = () => Number(readStorage(STORAGE.score, "0")) || 0;

    // ---- بازدید صفحه محصول (و تشخیص بازدید تکراری) ----
    const productMatch = pathname.match(/^\/products\/([a-z0-9-]+)$/);
    if (productMatch) {
      const slug = productMatch[1];
      let seen: string[] = [];
      try {
        seen = JSON.parse(readStorage(STORAGE.seenProducts, "[]")) as string[];
      } catch {
        seen = [];
      }

      if (seen.includes(slug)) {
        track(TRACK_EVENTS.productRepeatView, { product: slug });
      } else {
        track(TRACK_EVENTS.productView, { product: slug });
        writeStorage(STORAGE.seenProducts, JSON.stringify([...seen, slug].slice(-20)));
      }
    }

    if (pathname.startsWith("/checkout/")) {
      track(TRACK_EVENTS.checkoutStart, {});
    }

    // ---- ماندن روی صفحه قیمت‌دار ----
    // فقط صفحاتی که واقعاً قیمت نشان می‌دهند حساب می‌شوند
    const hasPrice = Boolean(document.querySelector(".tnum"));
    let dwellTimer: ReturnType<typeof setTimeout> | undefined;
    if ((productMatch || pathname.startsWith("/checkout/")) && hasPrice) {
      dwellTimer = setTimeout(() => {
        track(TRACK_EVENTS.priceDwell, { path: pathname, seconds: DWELL_SECONDS });
      }, DWELL_SECONDS * 1000);
    }

    // ---- کلیک واتساپ و لینک مقاله به محصول ----
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.("a");
      if (!link) return;

      if (link.dataset.analytics === "whatsapp-click") {
        track(TRACK_EVENTS.whatsappClick, { path: pathname });
        return;
      }

      const href = link.getAttribute("href") ?? "";
      if (pathname.startsWith("/blog/") && href.startsWith("/products/")) {
        track(TRACK_EVENTS.blogToProduct, { to: href });
      }
    };

    // ---- شروع فرم ----
    // فقط یک‌بار در هر صفحه، حتی اگر کاربر بین فیلدها جابه‌جا شود
    let formStarted = false;
    const onFocus = (e: FocusEvent) => {
      if (formStarted) return;
      const el = e.target as HTMLElement | null;
      if (!el?.closest?.("form")) return;
      if (el.closest("[data-no-track]")) return;
      formStarted = true;
      track(TRACK_EVENTS.formStart, { path: pathname });
    };

    document.addEventListener("click", onClick);
    document.addEventListener("focusin", onFocus);

    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("focusin", onFocus);
      if (dwellTimer) clearTimeout(dwellTimer);
    };
  }, [pathname]);

  return null;
}
