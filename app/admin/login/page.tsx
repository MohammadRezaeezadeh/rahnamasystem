import { redirect } from "next/navigation";
import { currentUser, hasAnyAdmin } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!isDatabaseConfigured()) {
    return (
      <Notice title="دیتابیس تنظیم نشده">
        مقدار <code className="ltr">DATABASE_URL</code> در فایل{" "}
        <code className="ltr">.env.local</code> تنظیم نشده است.
      </Notice>
    );
  }

  // اگر هنوز کاربری ساخته نشده، به‌جای فرمِ همیشه‌ناموفق، دستور ساخت کاربر را نشان بده
  let ready = false;
  try {
    if (await currentUser()) redirect("/admin");
    ready = await hasAnyAdmin();
  } catch (error) {
    console.error("login page db check failed:", error);
    return (
      <Notice title="اتصال به دیتابیس برقرار نشد">
        مقدار <code className="ltr">DATABASE_URL</code> و{" "}
        <code className="ltr">DATABASE_SSL</code> را بررسی کنید.
      </Notice>
    );
  }

  if (!ready) {
    return (
      <Notice title="هنوز کاربری ساخته نشده">
        ابتدا ساختار دیتابیس را بسازید و یک کاربر اضافه کنید:
        <pre className="ltr mt-3 overflow-x-auto rounded-lg bg-ink-900 p-3 text-xs text-ink-100">
          npm run db:migrate{"\n"}npm run db:create-admin
        </pre>
      </Notice>
    );
  }

  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="text-xl font-extrabold text-ink-900">ورود به پنل مدیریت</h1>
      <p className="mt-2 text-sm text-ink-500">برای ویرایش قیمت‌ها و مشاهده سفارش‌ها وارد شوید.</p>
      <LoginForm />
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md py-10">
      <div className="rounded-card border border-accent-400 bg-accent-100 p-6">
        <h1 className="text-base font-extrabold text-ink-900">{title}</h1>
        <div className="mt-3 text-sm leading-loose text-ink-700">{children}</div>
      </div>
    </div>
  );
}
