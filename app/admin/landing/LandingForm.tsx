"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveLandingAction, type LandingFormState } from "./actions";
import type { LandingPage } from "@/lib/landing";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 rounded-xl bg-brand-700 px-6 text-sm font-bold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
    >
      {pending ? "در حال ذخیره…" : "ذخیره"}
    </button>
  );
}

const input =
  "mt-1.5 min-h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500";
const area =
  "mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 font-mono text-xs leading-loose outline-none focus:border-brand-500";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-700">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-[0.7rem] leading-relaxed text-ink-500">{hint}</p>}
    </div>
  );
}

export function LandingForm({
  page,
  products,
  initialSections,
  initialFaqs,
  initialComparison,
}: {
  page: LandingPage | null;
  products: { slug: string; label: string }[];
  initialSections: string;
  initialFaqs: string;
  initialComparison: string;
}) {
  const [state, action] = useActionState<LandingFormState, FormData>(saveLandingAction, {});
  const [kind, setKind] = useState(page?.kind ?? "industry");
  const [selected, setSelected] = useState<string[]>(page?.related_products ?? []);
  const [published, setPublished] = useState(page?.published ?? false);

  /**
   * همه فیلدها کنترل‌شده‌اند، نه defaultValue.
   * React نسخه ۱۹ فرم دارای prop به نام action را بعد از هر ارسال پاک
   * می‌کند — حتی وقتی اکشن خطا برگردانده. با فیلد کنترل‌نشده، یک خطای
   * اعتبارسنجی ساده کل محتوای نوشته‌شده را از بین می‌برد.
   */
  const [form, setForm] = useState({
    slug: page?.slug ?? "",
    title: page?.title ?? "",
    description: page?.description ?? "",
    h1: page?.h1 ?? "",
    intro: page?.intro ?? "",
    industry: page?.industry ?? "",
    area: page?.area ?? "",
    competitor: page?.competitor ?? "",
    sections: initialSections,
    comparison_rows: initialComparison,
    faqs: initialFaqs,
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));
  const slug = form.slug;

  const toggleProduct = (s: string) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const previewUrl = kind === "comparison" ? `/compare/${slug || "…"}` : `/${slug || "…"}`;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="related_products" value={selected.join(",")} />

      {/* ---------- نوع صفحه ---------- */}
      <fieldset className="rounded-card border border-ink-200 bg-white p-5">
        <legend className="px-1 text-xs font-bold text-ink-700">نوع صفحه</legend>
        <div className="mt-2 flex flex-wrap gap-2.5">
          {[
            { v: "industry", l: "صنف + منطقه", d: "مثلاً حسابداری تولیدی شهرک صنعتی توس" },
            { v: "comparison", l: "مقایسه با رقیب", d: "مثلاً سپیدار در برابر هلو" },
          ].map((o) => (
            <label
              key={o.v}
              className={`flex flex-1 cursor-pointer items-start gap-2.5 rounded-xl border p-3.5 transition-colors ${
                kind === o.v ? "border-brand-500 bg-brand-50" : "border-ink-200"
              }`}
            >
              <input
                type="radio"
                name="kind"
                value={o.v}
                checked={kind === o.v}
                onChange={() => setKind(o.v as typeof kind)}
                className="mt-0.5 size-4 accent-brand-700"
              />
              <span>
                <span className="block text-sm font-bold text-ink-900">{o.l}</span>
                <span className="mt-0.5 block text-[0.7rem] text-ink-500">{o.d}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* ---------- آدرس و سئو ---------- */}
      <fieldset className="space-y-4 rounded-card border border-ink-200 bg-white p-5">
        <legend className="px-1 text-xs font-bold text-ink-700">آدرس و سئو</legend>

        <Field
          label="آدرس صفحه (اسلاگ)"
          hint={`صفحه روی این آدرس ساخته می‌شود: ${previewUrl} — فقط حروف کوچک انگلیسی، عدد و خط تیره`}
        >
          <input
            name="slug"
            dir="ltr"
            required
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="hesabdari-tolidi-mashhad"
            className={`${input} font-mono`}
            readOnly={Boolean(page)}
          />
        </Field>
        {page && (
          <p className="text-[0.7rem] text-ink-500">
            اسلاگ صفحه منتشرشده قابل تغییر نیست — عوض کردنش لینک‌های گوگل را می‌شکند. اگر
            لازم است، صفحه جدید بسازید.
          </p>
        )}

        <Field label="عنوان صفحه (تگ title)" hint="همان چیزی که در نتیجه گوگل آبی و کلیک‌شدنی است">
          <input
            name="title"
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="نرم‌افزار حسابداری تولیدی در شهرک صنعتی توس مشهد"
            className={input}
          />
        </Field>

        <Field label="توضیح متا" hint="حدود ۱۵۰ تا ۱۶۰ کاراکتر — زیر عنوان در گوگل نمایش داده می‌شود">
          <textarea
            name="description"
            required
            rows={2}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm leading-loose outline-none focus:border-brand-500"
          />
        </Field>
      </fieldset>

      {/* ---------- محتوا ---------- */}
      <fieldset className="space-y-4 rounded-card border border-ink-200 bg-white p-5">
        <legend className="px-1 text-xs font-bold text-ink-700">محتوای صفحه</legend>

        <Field label="تیتر اصلی (h1)" hint="بزرگ‌ترین تیتر بالای صفحه — می‌تواند با عنوان تگ title فرق کند">
          <input
            name="h1"
            required
            value={form.h1}
            onChange={(e) => set("h1", e.target.value)}
            placeholder="حسابداری واحدهای تولیدی شهرک صنعتی توس"
            className={input}
          />
        </Field>

        <Field label="مقدمه" hint="دو سه جمله زیر تیتر اصلی">
          <textarea
            name="intro"
            rows={3}
            value={form.intro}
            onChange={(e) => set("intro", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm leading-loose outline-none focus:border-brand-500"
          />
        </Field>

        {kind === "industry" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="صنف" hint="مثلاً: حسابداری تولیدی">
              <input name="industry" value={form.industry} onChange={(e) => set("industry", e.target.value)} className={input} />
            </Field>
            <Field label="منطقه" hint="مثلاً: شهرک صنعتی توس مشهد">
              <input name="area" value={form.area} onChange={(e) => set("area", e.target.value)} className={input} />
            </Field>
          </div>
        ) : (
          <Field label="نام نرم‌افزار رقیب" hint="مثلاً: هلو یا پارمیس">
            <input
              name="competitor"
              value={form.competitor}
              onChange={(e) => set("competitor", e.target.value)}
              className={input}
              required={kind === "comparison"}
            />
          </Field>
        )}

        <Field
          label="بخش‌های متن"
          hint="هر خطی که با ### شروع شود یک عنوان جدید است و خطوط بعدی متن آن بخش."
        >
          <textarea
            name="sections"
            rows={12}
            value={form.sections}
            onChange={(e) => set("sections", e.target.value)}
            placeholder={"### چرا واحدهای تولیدی به نسخه تخصصی نیاز دارند\nبهای تمام‌شده بدون فرمول ساخت…\n\n### راه‌اندازی در محل\nبرای کسب‌وکارهای شهرک صنعتی توس…"}
            className={area}
          />
        </Field>

        {kind === "comparison" && (
          <Field
            label="جدول مقایسه"
            hint="هر خط یک ردیف:  ویژگی | سپیدار | رقیب"
          >
            <textarea
              name="comparison_rows"
              rows={8}
              value={form.comparison_rows}
              onChange={(e) => set("comparison_rows", e.target.value)}
              placeholder={"بهای تمام‌شده تولید | دارد | ندارد\nپشتیبانی محلی مشهد | حضوری | تلفنی"}
              className={area}
            />
          </Field>
        )}

        <Field label="سؤالات متداول" hint="هر خط یک سؤال:  سؤال | جواب — این‌ها به گوگل هم به‌صورت FAQ معرفی می‌شوند">
          <textarea
            name="faqs"
            rows={6}
            value={form.faqs}
            onChange={(e) => set("faqs", e.target.value)}
            placeholder={"قیمت سپیدار تولیدی چقدر است؟ | به تعداد کاربر بستگی دارد…"}
            className={area}
          />
        </Field>
      </fieldset>

      {/* ---------- لینک داخلی ---------- */}
      <fieldset className="rounded-card border border-ink-200 bg-white p-5">
        <legend className="px-1 text-xs font-bold text-ink-700">محصولات مرتبط</legend>
        <p className="mt-1 text-[0.7rem] leading-relaxed text-ink-500">
          پایین صفحه به این محصولات لینک داده می‌شود. لینک داخلی برای سئو مهم است.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {products.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => toggleProduct(p.slug)}
              aria-pressed={selected.includes(p.slug)}
              className={`min-h-9 rounded-lg border px-3 text-xs font-bold transition-colors ${
                selected.includes(p.slug)
                  ? "border-brand-600 bg-brand-700 text-white"
                  : "border-ink-200 bg-white text-ink-700 hover:border-brand-400"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* ---------- انتشار ---------- */}
      <div className="flex flex-wrap items-center gap-4 rounded-card border border-ink-200 bg-white p-5">
        <label className="flex items-center gap-2.5 text-sm font-bold text-ink-900">
          <input
            type="checkbox"
            name="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="size-4 accent-brand-700"
          />
          منتشر شود
        </label>
        <p className="text-[0.7rem] text-ink-500">
          تا تیک نخورد، صفحه نه در گوگل می‌آید نه با آدرس باز می‌شود.
        </p>
        <div className="ms-auto">
          <Submit />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-loose text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800">
          {state.success}
        </p>
      )}
    </form>
  );
}
