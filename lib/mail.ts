import "server-only";
import nodemailer from "nodemailer";
import { site } from "./site";
import { formatSlotFull } from "./availability";
import type { Lead } from "./leads";

/**
 * اعلان ایمیلی سرنخ‌های جدید.
 *
 * قاعده‌ی سفت: **سرنخ هرگز نباید به‌خاطر خطای ایمیل از دست برود.**
 * اول در دیتابیس ذخیره می‌شود، بعد ایمیل تلاش می‌شود. اگر SMTP خراب باشد،
 * تنظیم نشده باشد یا تایم‌اوت بدهد، فرم همچنان موفق است و سرنخ در پنل هست.
 * ستون notified نشان می‌دهد کدام سرنخ‌ها ایمیلشان نرفته.
 */

export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function transport() {
  const port = Number(process.env.SMTP_PORT ?? 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // پورت ۴۶۵ از ابتدا رمزگذاری‌شده است؛ ۵۸۷ با STARTTLS بالا می‌آید
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function buildBody(lead: Lead): { text: string; html: string } {
  const rows: [string, string][] = [
    ["نام", lead.name ?? "—"],
    ["تلفن", lead.phone ?? "—"],
    ["نوع کسب‌وکار", lead.business_type ?? "—"],
    ["محصول موردنظر", lead.product_slug ?? "—"],
    ["زمان تماس", lead.preferred_slot ? formatSlotFull(lead.preferred_slot) : "هر زمانی"],
    ["منبع", lead.source ?? "—"],
  ];
  if (lead.message) rows.push(["توضیحات", lead.message]);

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

  const html = `<div dir="rtl" style="font-family:Tahoma,sans-serif;line-height:1.9;color:#0f172a">
  <h2 style="margin:0 0 12px;font-size:16px">درخواست مشاوره جدید</h2>
  <table cellpadding="6" style="border-collapse:collapse;font-size:14px">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="color:#64748b;white-space:nowrap">${escapeHtml(k)}</td><td style="font-weight:bold">${escapeHtml(v)}</td></tr>`,
      )
      .join("")}
  </table>
  <p style="margin-top:16px;font-size:12px;color:#64748b">
    شماره پیگیری: ${escapeHtml(lead.public_id)} —
    <a href="${site.url}/admin/leads">مشاهده در پنل</a>
  </p>
</div>`;

  return { text, html };
}

/**
 * ارسال اعلان. هرگز throw نمی‌کند.
 * @returns true اگر ایمیل واقعاً رفت
 */
export async function sendLeadNotification(lead: Lead): Promise<boolean> {
  const to = process.env.LEADS_NOTIFY_EMAIL || site.contact.email;
  if (!isMailConfigured() || !to) return false;

  const { text, html } = buildBody(lead);
  const slot = lead.preferred_slot ? ` (رزرو تماس)` : "";

  try {
    await transport().sendMail({
      from: `"${site.name}" <${process.env.SMTP_USER}>`,
      to,
      // replyTo خالی می‌ماند چون ایمیل مشتری را نمی‌گیریم؛ تماس تلفنی است
      subject: `سرنخ جدید: ${lead.name ?? "بدون نام"} — ${lead.phone ?? ""}${slot}`,
      text,
      html,
    });
    return true;
  } catch (error) {
    // فقط لاگ می‌شود؛ سرنخ از قبل در دیتابیس ذخیره شده است
    console.error("ارسال اعلان سرنخ ناموفق بود:", error);
    return false;
  }
}
