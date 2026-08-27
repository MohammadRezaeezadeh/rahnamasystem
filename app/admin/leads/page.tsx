import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { recentLeads, upcomingBookings, hotLeads } from "@/lib/leads";
import { isMailConfigured } from "@/lib/mail";
import { formatDateFa, formatNumber } from "@/lib/format";
import { scoreLabel } from "@/lib/tracking";
import { formatSlotFull } from "@/lib/availability";
import { updateLeadStatusAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS = [
  { value: "new", label: "جدید" },
  { value: "contacted", label: "تماس گرفته شد" },
  { value: "won", label: "تبدیل شد" },
  { value: "lost", label: "منتفی" },
] as const;

export default async function LeadsPage() {
  if (!(await currentUser())) redirect("/admin/login");

  const [leads, bookings, hot] = await Promise.all([
    recentLeads(100),
    upcomingBookings(),
    hotLeads(),
  ]);
  const mailReady = isMailConfigured();
  const unnotified = leads.filter((l) => !l.notified).length;

  return (
    <>
      <h1 className="text-xl font-extrabold text-ink-900">سرنخ‌ها</h1>
      <p className="mt-2 text-sm leading-loose text-ink-600">
        هر درخواست مشاوره اینجا ثبت می‌شود، حتی اگر ارسال ایمیل ناموفق باشد. وضعیت را بعد از
        تماس به‌روز کنید تا معلوم باشد چه کسی پیگیری شده.
      </p>

      {!mailReady && (
        <p className="mt-4 rounded-xl border border-accent-400 bg-accent-100 px-4 py-3 text-sm leading-loose text-ink-800">
          ارسال ایمیل تنظیم نشده است. سرنخ‌ها فقط در همین صفحه دیده می‌شوند و هیچ اعلانی برای
          شما ارسال نمی‌شود — این صفحه را روزی چند بار چک کنید تا وقتی
          <code className="ltr mx-1">SMTP_*</code> را تنظیم کنید.
        </p>
      )}

      {mailReady && unnotified > 0 && (
        <p className="mt-4 rounded-xl border border-accent-400 bg-accent-100 px-4 py-3 text-sm leading-loose text-ink-800">
          برای {unnotified} سرنخ ایمیل ارسال نشده (ستون «اعلان»). ممکن است تنظیمات SMTP مشکل
          داشته باشد.
        </p>
      )}

      {/* ---------- داغ‌ترین سرنخ‌ها ---------- */}
      {hot.length > 0 && (
        <section className="mt-8">
          <h2 className="text-base font-extrabold text-ink-900">از این‌ها شروع کنید</h2>
          <p className="mt-1 text-xs leading-loose text-ink-500">
            پیگیری‌نشده‌هایی که بیشترین نشانه قصد خرید را نشان داده‌اند — مرتب‌شده بر اساس
            امتیاز رفتاری، نه تاریخ.
          </p>
          <ul className="mt-3 space-y-2">
            {hot.map((lead) => (
              <li
                key={lead.public_id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-accent-400 bg-accent-100 px-4 py-3"
              >
                <ScorePill score={lead.score} />
                <span className="text-sm font-bold text-ink-900">{lead.name ?? "بدون نام"}</span>
                <a href={`tel:${lead.phone}`} className="ltr tnum text-sm font-bold text-ink-900">
                  {lead.phone}
                </a>
                {lead.business_type && (
                  <span className="text-xs text-ink-600">{lead.business_type}</span>
                )}
                {!lead.is_complete && (
                  <span className="rounded-md bg-white px-2 py-0.5 text-[0.7rem] font-bold text-ink-600">
                    فرم نیمه‌کاره
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- تماس‌های رزروشده ---------- */}
      {bookings.length > 0 && (
        <section className="mt-8">
          <h2 className="text-base font-extrabold text-ink-900">تماس‌های رزروشده آینده</h2>
          <ul className="mt-3 space-y-2">
            {bookings.map((b) => (
              <li
                key={b.public_id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3"
              >
                <span className="text-sm font-extrabold text-brand-800">
                  {formatSlotFull(b.preferred_slot!)}
                </span>
                <span className="text-sm text-ink-700">{b.name}</span>
                <a href={`tel:${b.phone}`} className="ltr tnum text-sm font-bold text-ink-900">
                  {b.phone}
                </a>
                {b.business_type && (
                  <span className="text-xs text-ink-500">{b.business_type}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- همه سرنخ‌ها ---------- */}
      <section className="mt-8">
        <h2 className="text-base font-extrabold text-ink-900">همه درخواست‌ها</h2>

        {leads.length === 0 ? (
          <p className="mt-3 rounded-card border border-ink-200 bg-white p-6 text-sm text-ink-500">
            هنوز درخواستی ثبت نشده است.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {leads.map((lead) => (
              <article
                key={lead.public_id}
                className="rounded-card border border-ink-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="text-sm font-extrabold text-ink-900">{lead.name ?? "بدون نام"}</h3>
                  <a
                    href={`tel:${lead.phone}`}
                    className="ltr tnum text-sm font-bold text-brand-700 hover:underline"
                  >
                    {lead.phone}
                  </a>
                  {lead.business_type && (
                    <span className="rounded-md bg-ink-100 px-2 py-0.5 text-xs text-ink-700">
                      {lead.business_type}
                    </span>
                  )}
                  <ScorePill score={lead.score} />
                  {!lead.is_complete && (
                    <span className="rounded-md bg-accent-100 px-2 py-0.5 text-[0.7rem] font-bold text-accent-600">
                      فرم نیمه‌کاره
                    </span>
                  )}
                  <span className="ms-auto text-xs text-ink-400">
                    {formatDateFa(lead.created_at)}
                  </span>
                </div>

                {lead.preferred_slot && (
                  <p className="mt-2 text-xs font-bold text-brand-700">
                    زمان رزروشده: {formatSlotFull(lead.preferred_slot)}
                  </p>
                )}

                {lead.message && (
                  <p className="mt-2 whitespace-pre-line text-sm leading-loose text-ink-600">
                    {lead.message}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-200 pt-3">
                  {STATUS.map((s) => (
                    <form key={s.value} action={updateLeadStatusAction}>
                      <input type="hidden" name="public_id" value={lead.public_id} />
                      <input type="hidden" name="status" value={s.value} />
                      <button
                        type="submit"
                        className={`min-h-9 rounded-lg px-3 text-xs font-bold transition-colors ${
                          lead.status === s.value
                            ? "bg-brand-700 text-white"
                            : "bg-ink-100 text-ink-600 hover:bg-ink-200"
                        }`}
                      >
                        {s.label}
                      </button>
                    </form>
                  ))}

                  <span
                    className={`ms-auto text-[0.7rem] font-bold ${
                      lead.notified ? "text-ink-400" : "text-accent-600"
                    }`}
                  >
                    {lead.notified ? "اعلان ارسال شد" : "اعلان ارسال نشد"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

/** نشان امتیاز رفتاری — رنگش نشان می‌دهد چقدر باید عجله کرد */
function ScorePill({ score }: { score: number }) {
  const { label, tone } = scoreLabel(score);
  const cls = {
    hot: "bg-red-100 text-red-800",
    warm: "bg-accent-100 text-accent-600",
    cold: "bg-ink-100 text-ink-500",
  }[tone];

  return (
    <span className={`rounded-md px-2 py-1 text-[0.7rem] font-bold ${cls}`} title="امتیاز رفتاری">
      {label} · {formatNumber(score)}
    </span>
  );
}
