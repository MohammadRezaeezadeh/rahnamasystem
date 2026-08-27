"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitConsultationAction, type ConsultState } from "./actions";
import type { DayGroup } from "@/lib/availability";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 w-full rounded-xl bg-brand-700 px-5 font-bold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
    >
      {pending ? "در حال ثبت…" : "ثبت درخواست"}
    </button>
  );
}

const field =
  "mt-1.5 min-h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500";

export function ConsultationForm({
  businessTypes,
  defaultProduct,
  days,
}: {
  businessTypes: { value: string; label: string }[];
  defaultProduct: string;
  days: DayGroup[];
}) {
  const [state, action] = useActionState<ConsultState, FormData>(submitConsultationAction, {});
  const [slot, setSlot] = useState("any");
  const [openDay, setOpenDay] = useState(days[0]?.key ?? "");

  const formRef = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  // نوشتن روی ref حین رندر مجاز نیست؛ بعد از موفقیت اینجا علامت می‌خورد
  // تا ارسال دوباره‌ی همان اطلاعات به‌عنوان «فرم رهاشده» ثبت نشود.
  useEffect(() => {
    if (state.success) submitted.current = true;
  }, [state.success]);

  /**
   * ثبت فرم رهاشده.
   *
   * اگر کاربر شماره معتبر وارد کرده ولی فرم را نفرستاده و صفحه را ترک
   * می‌کند، همان اطلاعات به‌عنوان سرنخ ناقص ثبت می‌شود.
   *
   * sendBeacon انتخاب شده چون تنها روشی است که مرورگر تضمین می‌کند حتی
   * هنگام بستن تب هم ارسال شود؛ fetch معمولی در آن لحظه قطع می‌شود.
   *
   * این رفتار در خود فرم به کاربر اطلاع داده شده — بدون آن اطلاع‌رسانی،
   * ذخیره داده‌ای که کاربر عمداً نفرستاده کار درستی نیست.
   */
  useEffect(() => {
    const flush = () => {
      if (submitted.current || !formRef.current) return;

      const data = new FormData(formRef.current);
      const phone = String(data.get("phone") ?? "").trim();
      if (!phone) return;

      submitted.current = true; // فقط یک‌بار

      const payload = JSON.stringify({
        name: data.get("name"),
        phone,
        businessType: data.get("business_type"),
        message: data.get("message"),
        productSlug: data.get("product"),
        score: window.rsScore?.() ?? 0,
      });

      try {
        navigator.sendBeacon?.("/api/lead", new Blob([payload], { type: "application/json" }));
        window.rsTrack?.("form_abandon", { path: "/consultation" });
      } catch {
        /* ترک صفحه نباید به‌خاطر این خطا بدهد */
      }
    };

    // pagehide روی سافاری موبایل قابل‌اتکاتر از beforeunload است
    const onHide = () => flush();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // بعد از موفقیت، فرم جای خودش را به پیام تأیید می‌دهد
  if (state.success) {
    return (
      <div className="rounded-card border border-brand-300 bg-brand-50 p-8 text-center">
        <div
          aria-hidden
          className="mx-auto grid size-12 place-items-center rounded-full bg-brand-700 text-white"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-extrabold text-ink-900">درخواست شما ثبت شد</h2>
        <p className="mt-3 text-sm leading-loose text-ink-700">{state.success}</p>
        {state.ref && (
          <p className="mt-4 text-xs text-ink-500">
            شماره پیگیری: <span className="ltr font-bold">{state.ref}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="space-y-6">
      <input type="hidden" name="product" value={defaultProduct} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-xs font-bold text-ink-700">
            نام و نام خانوادگی
          </label>
          <input id="name" name="name" required autoComplete="name" className={field} />
        </div>

        <div>
          <label htmlFor="phone" className="block text-xs font-bold text-ink-700">
            شماره موبایل
          </label>
          <input
            id="phone"
            name="phone"
            required
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="09151115822"
            className={`${field} tnum`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="business_type" className="block text-xs font-bold text-ink-700">
          نوع کسب‌وکار
        </label>
        <select id="business_type" name="business_type" defaultValue="" className={field}>
          <option value="">انتخاب کنید…</option>
          {businessTypes.map((b) => (
            <option key={b.value} value={b.label}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-xs font-bold text-ink-700">
          نیاز یا سؤال شما <span className="font-medium text-ink-400">(اختیاری)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          placeholder="مثلاً: الان با اکسل کار می‌کنیم و می‌خواهیم سامانه مودیان را راه بیندازیم."
          className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm leading-loose outline-none focus:border-brand-500"
        />
      </div>

      {/* ---------- رزرو زمان تماس ---------- */}
      <fieldset>
        <legend className="text-sm font-extrabold text-ink-900">
          چه زمانی تماس بگیریم؟
        </legend>
        <p className="mt-1 text-xs text-ink-500">
          انتخاب زمان اختیاری است. اگر انتخاب نکنید، در اولین فرصت کاری تماس می‌گیریم.
        </p>

        <input type="hidden" name="slot" value={slot} />

        <label
          className={`mt-3 flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors ${
            slot === "any" ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white"
          }`}
        >
          <input
            type="radio"
            checked={slot === "any"}
            onChange={() => setSlot("any")}
            className="size-4 accent-brand-700"
          />
          <span className="text-sm font-bold text-ink-900">هر زمانی، خودتان تماس بگیرید</span>
        </label>

        {days.length === 0 ? (
          <p className="mt-3 rounded-xl bg-ink-100 px-4 py-3 text-xs leading-loose text-ink-600">
            فعلاً زمان آزادی برای رزرو نیست. درخواستتان را ثبت کنید تا تماس بگیریم.
          </p>
        ) : (
          <div className="mt-3 min-w-0 rounded-xl border border-ink-200 bg-white">
            {/* انتخاب روز */}
            <div className="flex gap-1.5 overflow-x-auto border-b border-ink-200 p-2">
              {days.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setOpenDay(day.key)}
                  className={`min-h-10 whitespace-nowrap rounded-lg px-3 text-xs font-bold transition-colors ${
                    openDay === day.key
                      ? "bg-brand-700 text-white"
                      : "bg-ink-100 text-ink-700 hover:bg-ink-200"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>

            {/* بازه‌های آن روز */}
            <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
              {days
                .find((d) => d.key === openDay)
                ?.slots.map((s) => (
                  <button
                    key={s.iso}
                    type="button"
                    onClick={() => setSlot(s.iso)}
                    aria-pressed={slot === s.iso}
                    className={`tnum min-h-11 rounded-lg border px-2 text-xs font-bold transition-colors ${
                      slot === s.iso
                        ? "border-brand-600 bg-brand-700 text-white"
                        : "border-ink-200 bg-white text-ink-700 hover:border-brand-400"
                    }`}
                  >
                    {s.timeLabel}
                  </button>
                ))}
            </div>
          </div>
        )}
      </fieldset>

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-loose text-red-700">
          {state.error}
          {state.slotConflict && " صفحه را تازه کنید تا زمان‌های به‌روز را ببینید."}
        </p>
      )}

      <Submit />

      <p className="text-center text-xs leading-loose text-ink-500">
        شماره شما فقط برای همین تماس استفاده می‌شود. اگر فرم را نیمه‌کاره رها کنید و
        شماره‌تان را وارد کرده باشید، ممکن است برای پیگیری با شما تماس بگیریم.
      </p>
    </form>
  );
}
