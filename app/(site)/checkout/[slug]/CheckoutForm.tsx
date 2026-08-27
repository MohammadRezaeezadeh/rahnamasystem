"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { startCheckoutAction, type CheckoutState } from "../actions";
import { formatPrice } from "@/lib/format";

type ProviderOption = { id: string; label: string; hint: string };

function Submit({ amount }: { amount: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 w-full rounded-xl bg-brand-700 px-5 font-bold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
    >
      {pending ? "در حال انتقال به درگاه…" : `پرداخت ${formatPrice(amount)}`}
    </button>
  );
}

export function CheckoutForm({
  slug,
  amountToman,
  providers,
}: {
  slug: string;
  amountToman: number;
  providers: ProviderOption[];
}) {
  const [state, action] = useActionState<CheckoutState, FormData>(startCheckoutAction, {});
  const [provider, setProvider] = useState(providers[0]?.id ?? "");

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="slug" value={slug} />

      {/* ---- مشخصات: فقط دو فیلد، همان‌قدر که برای تماس لازم است ---- */}
      <fieldset>
        <legend className="text-sm font-extrabold text-ink-900">مشخصات شما</legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-xs font-bold text-ink-700">
              نام و نام خانوادگی
            </label>
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              className="mt-1.5 min-h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500"
            />
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
              className="tnum mt-1.5 min-h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </fieldset>

      {/* ---- روش پرداخت ---- */}
      <fieldset>
        <legend className="text-sm font-extrabold text-ink-900">روش پرداخت</legend>
        <div className="mt-3 space-y-2.5">
          {providers.map((p) => (
            <label
              key={p.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                provider === p.id ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white"
              }`}
            >
              <input
                type="radio"
                name="provider"
                value={p.id}
                checked={provider === p.id}
                onChange={() => setProvider(p.id)}
                className="mt-1 size-4 accent-brand-700"
              />
              <span>
                <span className="block text-sm font-bold text-ink-900">{p.label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{p.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-loose text-red-700">
          {state.error}
        </p>
      )}

      <Submit amount={amountToman} />

      <p className="text-center text-xs leading-loose text-ink-500">
        با زدن دکمه پرداخت به درگاه امن بانکی منتقل می‌شوید.
      </p>
    </form>
  );
}
