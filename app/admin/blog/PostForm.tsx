"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { savePostAction, type PostFormState } from "./actions";
import { CATEGORIES, parseArticle, readingMinutes, type Post } from "@/lib/blog-content";
import { formatNumber } from "@/lib/format";

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
const textarea =
  "mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm leading-loose outline-none focus:border-brand-500";

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

/**
 * ⚠️ همه فیلدها عمداً کنترل‌شده‌اند (state، نه defaultValue).
 *
 * React نسخه ۱۹ فرمی را که prop به نام action دارد، بعد از هر ارسال
 * به‌صورت خودکار پاک می‌کند — حتی وقتی اکشن خطا برگردانده. با فیلدهای
 * کنترل‌نشده، یک خطای اعتبارسنجی ساده کل متن مقاله را از بین می‌برد.
 */
export function PostForm({
  post,
  products,
}: {
  post: Post | null;
  products: { slug: string; label: string }[];
}) {
  const [state, action] = useActionState<PostFormState, FormData>(savePostAction, {});

  const [form, setForm] = useState({
    slug: post?.slug ?? "",
    title: post?.title ?? "",
    description: post?.description ?? "",
    excerpt: post?.excerpt ?? "",
    category: post?.category ?? "",
    body: post?.body ?? "",
    published: post?.published ?? false,
  });
  const [selected, setSelected] = useState<string[]>(post?.related_products ?? []);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggle = (s: string) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  // پیش‌نمایش زنده با همان پارسری که سرور استفاده می‌کند
  const blocks = parseArticle(form.body);
  const counts = blocks.reduce<Record<string, number>>((acc, b) => {
    acc[b.type] = (acc[b.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="related_products" value={selected.join(",")} />

      {/* ---------- سئو ---------- */}
      <fieldset className="space-y-4 rounded-card border border-ink-200 bg-white p-5">
        <legend className="px-1 text-xs font-bold text-ink-700">آدرس و سئو</legend>

        <Field label="آدرس مقاله (اسلاگ)" hint={`مقاله روی /blog/${form.slug || "…"} ساخته می‌شود`}>
          <input
            name="slug"
            dir="ltr"
            required
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="samane-moadian-rahnama"
            className={`${input} font-mono`}
            readOnly={Boolean(post)}
          />
        </Field>

        <Field label="عنوان مقاله">
          <input
            name="title"
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className={input}
          />
        </Field>

        <Field
          label="توضیح متا"
          hint={`${formatNumber(form.description.length)} کاراکتر — حدود ۱۵۰ تا ۱۶۰ ایده‌آل است`}
        >
          <textarea
            name="description"
            required
            rows={2}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className={textarea}
          />
        </Field>

        <Field label="خلاصه" hint="در کارت فهرست وبلاگ نمایش داده می‌شود">
          <textarea
            name="excerpt"
            required
            rows={2}
            value={form.excerpt}
            onChange={(e) => update("excerpt", e.target.value)}
            className={textarea}
          />
        </Field>

        <Field label="دسته‌بندی">
          <select
            name="category"
            required
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className={input}
          >
            <option value="">انتخاب کنید…</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </fieldset>

      {/* ---------- متن ---------- */}
      <fieldset className="rounded-card border border-ink-200 bg-white p-5">
        <legend className="px-1 text-xs font-bold text-ink-700">متن مقاله</legend>

        <div className="mt-2 rounded-lg bg-ink-50 p-3 text-[0.7rem] leading-loose text-ink-600">
          <p className="font-bold text-ink-800">قالب نوشتن:</p>
          <ul className="mt-1.5 space-y-1">
            <li>
              <code className="ltr rounded bg-white px-1.5 py-0.5">### عنوان</code> → تیتر بخش
            </li>
            <li>
              <code className="ltr rounded bg-white px-1.5 py-0.5">- مورد</code> → فهرست نقطه‌ای
            </li>
            <li>
              <code className="ltr rounded bg-white px-1.5 py-0.5">&gt; نکته</code> → کادر تأکید
            </li>
            <li>
              <code className="ltr rounded bg-white px-1.5 py-0.5">
                [[manufacturing|نسخه تولیدی]]
              </code>{" "}
              → لینک داخلی به صفحه محصول
            </li>
            <li>خط خالی، پاراگراف را می‌بندد.</li>
          </ul>
        </div>

        <textarea
          name="body"
          required
          rows={20}
          value={form.body}
          onChange={(e) => update("body", e.target.value)}
          className="mt-3 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 font-mono text-xs leading-loose outline-none focus:border-brand-500"
        />

        <p className="mt-2 text-[0.7rem] text-ink-500">
          {formatNumber(counts.heading ?? 0)} تیتر · {formatNumber(counts.paragraph ?? 0)} پاراگراف
          · {formatNumber(counts.list ?? 0)} فهرست · حدود{" "}
          {formatNumber(readingMinutes(form.body))} دقیقه مطالعه
        </p>
      </fieldset>

      {/* ---------- لینک داخلی ---------- */}
      <fieldset className="rounded-card border border-ink-200 bg-white p-5">
        <legend className="px-1 text-xs font-bold text-ink-700">محصولات مرتبط</legend>
        <p className="mt-1 text-[0.7rem] leading-relaxed text-ink-500">
          حداقل یکی لازم است. محصولاتی که در خود متن با
          <code className="ltr mx-1 rounded bg-ink-100 px-1.5 py-0.5">[[…]]</code>
          لینک داده‌اید هم خودکار اضافه می‌شوند.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {products.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => toggle(p.slug)}
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
            checked={form.published}
            onChange={(e) => update("published", e.target.checked)}
            className="size-4 accent-brand-700"
          />
          منتشر شود
        </label>
        <p className="text-[0.7rem] text-ink-500">تا تیک نخورد، مقاله در سایت دیده نمی‌شود.</p>
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
        <p
          role="status"
          className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-bold leading-loose text-brand-800"
        >
          {state.success}
        </p>
      )}
    </form>
  );
}
