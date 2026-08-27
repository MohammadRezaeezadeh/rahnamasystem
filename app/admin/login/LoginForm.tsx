"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type FormState } from "../actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 w-full rounded-xl bg-brand-700 px-5 font-bold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
    >
      {pending ? "در حال ورود…" : "ورود"}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState<FormState, FormData>(loginAction, {});

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-semibold text-ink-800">
          نام کاربری
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          dir="ltr"
          className="mt-1.5 min-h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-ink-800">
          رمز عبور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          className="mt-1.5 min-h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-500"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Submit />
    </form>
  );
}
