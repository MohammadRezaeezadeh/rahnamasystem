"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { changePasswordAction, addAdminAction, type SettingsState } from "./actions";

const input =
  "mt-1.5 min-h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-10 rounded-xl bg-brand-700 px-5 text-sm font-bold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
    >
      {pending ? "لطفاً صبر کنید…" : label}
    </button>
  );
}

function Result({ state }: { state: SettingsState }) {
  if (state.error)
    return (
      <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        {state.error}
      </p>
    );
  if (state.success)
    return (
      <p role="status" className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm font-bold text-brand-800">
        {state.success}
      </p>
    );
  return null;
}

/** فیلدها کنترل‌شده‌اند چون React فرم را بعد از هر ارسال پاک می‌کند */
export function ChangePasswordForm() {
  const [state, action] = useActionState<SettingsState, FormData>(changePasswordAction, {});
  const [fields, setFields] = useState({ current: "", next: "", confirm: "" });
  const set = (k: keyof typeof fields, v: string) => setFields((p) => ({ ...p, [k]: v }));

  return (
    <form action={action} className="rounded-card border border-ink-200 bg-white p-5">
      <h2 className="text-base font-extrabold text-ink-900">تغییر رمز عبور</h2>
      <p className="mt-1 text-xs text-ink-500">حداقل ۸ کاراکتر.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="current_password" className="block text-xs font-bold text-ink-700">
            رمز فعلی
          </label>
          <input
            id="current_password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            required
            dir="ltr"
            value={fields.current}
            onChange={(e) => set("current", e.target.value)}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="new_password" className="block text-xs font-bold text-ink-700">
            رمز جدید
          </label>
          <input
            id="new_password"
            name="new_password"
            type="password"
            autoComplete="new-password"
            required
            dir="ltr"
            value={fields.next}
            onChange={(e) => set("next", e.target.value)}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="confirm_password" className="block text-xs font-bold text-ink-700">
            تکرار رمز جدید
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            dir="ltr"
            value={fields.confirm}
            onChange={(e) => set("confirm", e.target.value)}
            className={input}
          />
        </div>
      </div>

      <div className="mt-4">
        <Submit label="تغییر رمز" />
      </div>
      <Result state={state} />
    </form>
  );
}

export function AddAdminForm() {
  const [state, action] = useActionState<SettingsState, FormData>(addAdminAction, {});
  const [fields, setFields] = useState({ username: "", password: "", name: "" });
  const set = (k: keyof typeof fields, v: string) => setFields((p) => ({ ...p, [k]: v }));

  return (
    <form action={action} className="mt-5 rounded-card border border-ink-200 bg-white p-5">
      <h2 className="text-base font-extrabold text-ink-900">افزودن کاربر</h2>
      <p className="mt-1 text-xs leading-relaxed text-ink-500">
        همه کاربران دسترسی یکسان دارند — عمداً سیستم نقش نداریم چون برای یک تیم دو نفره
        پیچیدگی بی‌فایده است.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="username" className="block text-xs font-bold text-ink-700">
            نام کاربری
          </label>
          <input
            id="username"
            name="username"
            required
            dir="ltr"
            placeholder="reza"
            value={fields.username}
            onChange={(e) => set("username", e.target.value)}
            className={`${input} font-mono`}
          />
        </div>
        <div>
          <label htmlFor="new_user_password" className="block text-xs font-bold text-ink-700">
            رمز عبور
          </label>
          <input
            id="new_user_password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            dir="ltr"
            value={fields.password}
            onChange={(e) => set("password", e.target.value)}
            className={input}
          />
        </div>
        <div>
          <label htmlFor="display_name" className="block text-xs font-bold text-ink-700">
            نام نمایشی
          </label>
          <input
            id="display_name"
            name="display_name"
            value={fields.name}
            onChange={(e) => set("name", e.target.value)}
            className={input}
          />
        </div>
      </div>

      <div className="mt-4">
        <Submit label="افزودن کاربر" />
      </div>
      <Result state={state} />
    </form>
  );
}
