import { redirect } from "next/navigation";
import { currentUser, listAdmins } from "@/lib/auth";
import { getHealth, type Check } from "@/lib/health";
import { site } from "@/lib/site";
import { formatDateFa, formatNumber } from "@/lib/format";
import { ChangePasswordForm, AddAdminForm } from "./SettingsForms";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) redirect("/admin/login");

  const [health, admins] = await Promise.all([getHealth(), listAdmins().catch(() => [])]);

  const yours = health.checks.filter((c) => c.owner === "you" && c.status !== "ok");
  const devs = health.checks.filter((c) => c.owner === "dev" && c.status !== "ok");
  const done = health.checks.filter((c) => c.status === "ok");

  return (
    <>
      <h1 className="text-xl font-extrabold text-ink-900">تنظیمات و وضعیت راه‌اندازی</h1>
      <p className="mt-2 text-sm leading-loose text-ink-600">
        این صفحه خودش نگاه می‌کند چه چیزی واقعاً تنظیم شده — چک‌لیست دستی نیست.
      </p>

      {health.blockingCount > 0 && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-loose text-red-800">
          <strong>{formatNumber(health.blockingCount)} مورد</strong> تا انتشار سایت اصلی باقی
          مانده. تا این‌ها انجام نشوند سایت آماده نیست.
        </p>
      )}

      {health.todoCount === 0 && (
        <p className="mt-4 rounded-xl border border-brand-300 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800">
          همه موارد تنظیم شده‌اند. سایت آماده است.
        </p>
      )}

      {/* ---------- کارهای شما ---------- */}
      {yours.length > 0 && (
        <section className="mt-8">
          <h2 className="text-base font-extrabold text-ink-900">کارهایی که با شماست</h2>
          <p className="mt-1 text-xs text-ink-500">
            این‌ها کار اداری یا حساب کاربری‌اند و از داخل کد قابل انجام نیستند.
          </p>
          <ul className="mt-3 space-y-3">
            {yours.map((check) => (
              <CheckCard key={check.id} check={check} />
            ))}
          </ul>
        </section>
      )}

      {/* ---------- کارهای فنی ---------- */}
      {devs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-base font-extrabold text-ink-900">کارهای فنی</h2>
          <ul className="mt-3 space-y-3">
            {devs.map((check) => (
              <CheckCard key={check.id} check={check} />
            ))}
          </ul>
        </section>
      )}

      {/* ---------- انجام‌شده ---------- */}
      {done.length > 0 && (
        <section className="mt-8">
          <h2 className="text-base font-extrabold text-ink-900">
            انجام شده ({formatNumber(done.length)})
          </h2>
          <ul className="mt-3 space-y-1.5">
            {done.map((check) => (
              <li
                key={check.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-white px-4 py-2.5"
              >
                <svg
                  aria-hidden
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="shrink-0 text-brand-600"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span className="text-sm font-bold text-ink-800">{check.title}</span>
                <span className="text-xs text-ink-500">{check.detail}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- اطلاعات کسب‌وکار ---------- */}
      <section className="mt-10">
        <h2 className="text-base font-extrabold text-ink-900">اطلاعات کسب‌وکار</h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-500">
          این‌ها در فایل <code className="ltr">lib/site.ts</code> هستند و در هدر، فوتر، صفحه تماس
          و داده‌های گوگل استفاده می‌شوند. برای تغییرشان به من بگویید.
        </p>
        <dl className="mt-3 divide-y divide-ink-200 rounded-card border border-ink-200 bg-white text-sm">
          <Row label="نام کامل" value={site.legalName} />
          <Row label="تلفن اصلی" value={site.contact.primary.label} ltr />
          <Row label="دفتر شهرک" value={site.contact.office.label} ltr />
          <Row label="واتساپ" value={site.contact.whatsappLabel} ltr />
          <Row label="ایمیل" value={site.contact.email} ltr />
          <Row label="آدرس" value={`${site.address.city}، ${site.address.street}`} />
          <Row label="نماینده" value={site.representative.name} />
          <Row label="ساعات کاری" value={site.openingHoursLabel} />
          <Row label="آدرس سایت" value={site.url} ltr />
        </dl>
      </section>

      {/* ---------- کاربران ---------- */}
      <section className="mt-10">
        <h2 className="text-base font-extrabold text-ink-900">کاربران پنل</h2>
        {admins.length > 0 && (
          <ul className="mt-3 divide-y divide-ink-200 rounded-card border border-ink-200 bg-white">
            {admins.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                <span className="text-sm font-bold text-ink-900">
                  {a.display_name || a.username}
                </span>
                <span className="ltr font-mono text-xs text-ink-500">{a.username}</span>
                {a.id === user.id && (
                  <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[0.7rem] font-bold text-brand-800">
                    شما
                  </span>
                )}
                <span className="ms-auto text-[0.7rem] text-ink-400">
                  {a.last_login_at
                    ? `آخرین ورود: ${formatDateFa(a.last_login_at)}`
                    : "هنوز وارد نشده"}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5">
          <ChangePasswordForm />
          <AddAdminForm />
        </div>
      </section>
    </>
  );
}

function CheckCard({ check }: { check: Check }) {
  const tone =
    check.status === "todo"
      ? { border: "border-red-200", bg: "bg-red-50", chip: "bg-red-100 text-red-800", label: "انجام نشده" }
      : { border: "border-accent-400", bg: "bg-accent-100", chip: "bg-white text-accent-600", label: "بهتر است انجام شود" };

  return (
    <li className={`rounded-card border ${check.blocking ? "border-red-300" : tone.border} ${tone.bg} p-5`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="text-sm font-extrabold text-ink-900">{check.title}</h3>
        <span className={`rounded-md px-2 py-0.5 text-[0.7rem] font-bold ${tone.chip}`}>
          {tone.label}
        </span>
        {check.blocking && (
          <span className="rounded-md bg-red-600 px-2 py-0.5 text-[0.7rem] font-bold text-white">
            مانع انتشار
          </span>
        )}
      </div>

      <p className="mt-2 text-sm leading-loose text-ink-700">{check.detail}</p>

      {check.action && (
        <p className="mt-3 border-t border-ink-200/60 pt-3 text-sm leading-loose text-ink-800">
          <strong className="text-ink-900">چه کاری کنید: </strong>
          {check.action}
        </p>
      )}
    </li>
  );
}

function Row({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 px-4 py-3">
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className={`font-semibold text-ink-900 ${ltr ? "ltr tnum" : ""}`}>{value || "—"}</dd>
    </div>
  );
}
