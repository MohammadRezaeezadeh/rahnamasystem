"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { savePricingAction, type FormState } from "../actions";
import type { Pricing } from "@/lib/pricing";
import type { Product } from "@/lib/products";
import { formatPrice, toEnDigits } from "@/lib/format";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-10 rounded-xl bg-brand-700 px-5 text-sm font-bold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
    >
      {pending ? "در حال ذخیره…" : "ذخیره"}
    </button>
  );
}

export function PriceForm({ product, pricing }: { product: Product; pricing: Pricing | null }) {
  const [state, action] = useActionState<FormState, FormData>(savePricingAction, {});
  const [priceRaw, setPriceRaw] = useState(pricing?.price_toman?.toString() ?? "");

  // پیش‌نمایش زنده — مدیر همان چیزی را می‌بیند که مشتری خواهد دید
  const parsed = Number(toEnDigits(priceRaw).replace(/[,٬\s]/g, ""));
  const preview =
    priceRaw.trim() && Number.isFinite(parsed) && parsed > 0
      ? formatPrice(parsed)
      : "استعلام قیمت";

  return (
    <form action={action} className="rounded-card border border-ink-200 bg-white p-5">
      <input type="hidden" name="slug" value={product.slug} />

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-extrabold text-ink-900">{product.shortName}</h2>
        <span className="text-xs text-ink-400">{product.name}</span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`price-${product.slug}`}
            className="block text-xs font-bold text-ink-700"
          >
            قیمت به تومان
          </label>
          <input
            id={`price-${product.slug}`}
            name="price_toman"
            inputMode="numeric"
            dir="ltr"
            value={priceRaw}
            onChange={(e) => setPriceRaw(e.target.value)}
            placeholder="خالی = استعلام قیمت"
            className="mt-1.5 min-h-10 w-full rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-brand-500"
          />
          <p className="mt-1.5 text-xs text-ink-500">
            روی سایت: <span className="font-bold text-ink-800">{preview}</span>
          </p>
        </div>

        <div>
          <label
            htmlFor={`note-${product.slug}`}
            className="block text-xs font-bold text-ink-700"
          >
            توضیح زیر قیمت
          </label>
          <input
            id={`note-${product.slug}`}
            name="price_note"
            defaultValue={pricing?.price_note ?? ""}
            placeholder="مثلاً: برای ۱ کاربر، بدون ماژول جانبی"
            className="mt-1.5 min-h-10 w-full rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor={`desc-${product.slug}`} className="block text-xs font-bold text-ink-700">
          توضیحات تکمیلی (در صفحه محصول نمایش داده می‌شود)
        </label>
        <textarea
          id={`desc-${product.slug}`}
          name="description"
          rows={3}
          defaultValue={pricing?.description ?? ""}
          className="mt-1.5 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm leading-loose outline-none focus:border-brand-500"
        />
      </div>

      <label className="mt-4 flex items-center gap-2.5 text-sm text-ink-800">
        <input
          type="checkbox"
          name="purchasable"
          defaultChecked={pricing?.purchasable ?? false}
          className="size-4 accent-brand-700"
        />
        خرید آنلاین این بسته فعال باشد
      </label>

      <div className="mt-5 flex items-center gap-3 border-t border-ink-200 pt-4">
        <Submit />
        {state.error && (
          <p role="alert" className="text-sm font-semibold text-red-700">
            {state.error}
          </p>
        )}
        {state.success && (
          <p role="status" className="text-sm font-semibold text-brand-700">
            {state.success}
          </p>
        )}
      </div>
    </form>
  );
}
