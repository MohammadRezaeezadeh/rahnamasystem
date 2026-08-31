import "server-only";
import { site } from "./site";
import { queryOne, isDatabaseConfigured } from "./db";
import { availableProviders } from "./payments";
import { isMailConfigured } from "./mail";

/**
 * وضعیت راه‌اندازی سایت.
 *
 * این فایل به‌جای یک چک‌لیست کاغذی است: به‌جای اینکه در مستندات بنویسیم
 * «یادت باشد اینماد بگیری»، پنل خودش نگاه می‌کند چه چیزی واقعاً تنظیم
 * شده و چه چیزی نه.
 *
 * هر مورد می‌گوید کارِ چه کسی است: «شما» یعنی کار اداری یا حساب کاربری
 * که فقط صاحب کسب‌وکار می‌تواند انجام دهد.
 */

export type CheckStatus = "ok" | "todo" | "warn";

export type Check = {
  id: string;
  title: string;
  status: CheckStatus;
  /** توضیح وضعیت فعلی */
  detail: string;
  /** اگر انجام نشده، دقیقاً چه کاری باید کرد */
  action?: string;
  /** کار چه کسی است */
  owner: "you" | "dev";
  /** آیا تا انجام نشدنش سایت نباید منتشر شود */
  blocking: boolean;
};

export type HealthReport = {
  checks: Check[];
  blockingCount: number;
  todoCount: number;
};

async function countRows(table: string, where = ""): Promise<number> {
  try {
    const row = await queryOne<{ n: string }>(
      `select count(*)::text as n from ${table} ${where}`,
    );
    return Number(row?.n ?? 0);
  } catch {
    return -1; // یعنی نتوانستیم بخوانیم، نه اینکه صفر است
  }
}

export async function getHealth(): Promise<HealthReport> {
  const checks: Check[] = [];

  // ---------------------------------------------------------- زیرساخت
  const isLocalUrl = site.url.includes("localhost");
  checks.push({
    id: "domain",
    title: "دامنه روی سایت تنظیم شده",
    status: isLocalUrl ? "todo" : "ok",
    detail: isLocalUrl
      ? `آدرس فعلی ${site.url} است — یعنی هنوز روی سرور واقعی تنظیم نشده.`
      : `آدرس سایت: ${site.url}`,
    action: isLocalUrl
      ? "در پنل لیارا متغیر NEXT_PUBLIC_SITE_URL را روی https://rahnamasystemco.ir بگذارید."
      : undefined,
    owner: "you",
    blocking: true,
  });

  checks.push({
    id: "indexing",
    title: "اجازه ایندکس گوگل",
    status: site.allowIndexing ? "ok" : "todo",
    detail: site.allowIndexing
      ? "گوگل اجازه دارد سایت را ایندکس کند."
      : "کل سایت با robots.txt از گوگل پنهان است. این روی نسخه آزمایشی درست است، ولی روی سایت اصلی باید فعال شود.",
    action: site.allowIndexing
      ? undefined
      : "فقط روی سرور اصلی، متغیر NEXT_PUBLIC_ALLOW_INDEXING را برابر true بگذارید.",
    owner: "you",
    blocking: true,
  });

  const dbUp = isDatabaseConfigured() && (await countRows("admin_users")) >= 0;
  checks.push({
    id: "database",
    title: "اتصال دیتابیس",
    status: dbUp ? "ok" : "todo",
    detail: dbUp
      ? "دیتابیس در دسترس است."
      : "اتصال به دیتابیس برقرار نیست. قیمت‌ها، سرنخ‌ها و مقالات بدون آن کار نمی‌کنند.",
    action: dbUp ? undefined : "متغیرهای DATABASE_URL و DATABASE_SSL را بررسی کنید.",
    owner: "you",
    blocking: true,
  });

  // ---------------------------------------------------------- پرداخت
  const providers = availableProviders();
  const hasZarinpal = providers.some((p) => p.id === "zarinpal");
  const hasSnappay = providers.some((p) => p.id === "snappay");

  checks.push({
    id: "zarinpal",
    title: "درگاه پرداخت زرین‌پال",
    status: hasZarinpal ? "ok" : "todo",
    detail: hasZarinpal
      ? "کد پذیرندگی ثبت شده و درگاه فعال است."
      : "بدون این، دکمه خرید روی سایت نمی‌آید و فقط مشاوره پیشنهاد می‌شود.",
    action: hasZarinpal
      ? undefined
      : "اول اینماد بگیرید، بعد در zarinpal.com درگاه بسازید و کد پذیرندگی را در ZARINPAL_MERCHANT_ID بگذارید.",
    owner: "you",
    blocking: false,
  });

  checks.push({
    id: "snappay",
    title: "پرداخت قسطی اسنپ‌پی",
    status: hasSnappay ? "ok" : "todo",
    detail: hasSnappay
      ? "کلیدها ثبت شده‌اند."
      : "قرارداد پذیرندگی امضا نشده. تا آن موقع گزینه قسطی در صفحه تسویه نمایش داده نمی‌شود.",
    action: hasSnappay
      ? undefined
      : "با اسنپ‌پی برای پذیرندگی تماس بگیرید و بعد از دریافت مستندات، کلیدها را بدهید تا اتصال نوشته شود.",
    owner: "you",
    blocking: false,
  });

  // ---------------------------------------------------------- ارتباط
  const mailReady = isMailConfigured();
  checks.push({
    id: "smtp",
    title: "اعلان ایمیلی سرنخ‌ها",
    status: mailReady ? "ok" : "warn",
    detail: mailReady
      ? "درخواست‌های جدید به ایمیل شما فرستاده می‌شوند."
      : "سرنخ‌ها ذخیره می‌شوند ولی ایمیلی نمی‌آید — باید صفحه سرنخ‌ها را دستی چک کنید.",
    action: mailReady
      ? undefined
      : "در حساب گوگل «تأیید دو مرحله‌ای» را روشن کنید، از myaccount.google.com/apppasswords یک رمز برنامه بسازید و در SMTP_PASS بگذارید.",
    owner: "you",
    blocking: false,
  });

  const whatsappPlaceholder = site.contact.whatsapp.endsWith("0000000");
  checks.push({
    id: "whatsapp",
    title: "شماره واتساپ",
    status: whatsappPlaceholder ? "todo" : "ok",
    detail: whatsappPlaceholder
      ? "شماره واتساپ هنوز نمونه است و دکمه‌های واتساپ به جایی نمی‌رسند."
      : `دکمه‌های واتساپ به ${site.contact.whatsappLabel} وصل‌اند.`,
    action: whatsappPlaceholder ? "شماره واتساپ واقعی را بدهید تا در lib/site.ts ثبت شود." : undefined,
    owner: "you",
    blocking: false,
  });

  checks.push({
    id: "postal",
    title: "کد پستی و موقعیت دفتر",
    status: site.address.postalCode ? "ok" : "warn",
    detail: site.address.postalCode
      ? "اطلاعات کامل در schema.org ثبت می‌شود."
      : "کد پستی خالی است. برای سئوی محلی و ثبت در گوگل مپ لازم می‌شود.",
    action: site.address.postalCode
      ? undefined
      : "کد پستی دفتر و موقعیت دقیق روی نقشه را بدهید.",
    owner: "you",
    blocking: false,
  });

  // ---------------------------------------------------------- محتوا
  if (dbUp) {
    const pricedCount = await countRows("product_pricing", "where price_toman is not null");
    checks.push({
      id: "prices",
      title: "قیمت محصولات",
      status: pricedCount > 0 ? "ok" : "todo",
      detail:
        pricedCount > 0
          ? `${pricedCount} بسته قیمت دارد.`
          : "هیچ بسته‌ای قیمت ندارد و همه «استعلام قیمت» نشان می‌دهند.",
      action: pricedCount > 0 ? undefined : "در بخش قیمت‌ها، قیمت هر بسته را وارد کنید.",
      owner: "you",
      blocking: false,
    });

    const landingCount = await countRows("landing_pages", "where published = true");
    checks.push({
      id: "landing",
      title: "لندینگ‌پیج‌های صنفی",
      status: landingCount >= 3 ? "ok" : "warn",
      detail: `${landingCount} صفحه منتشر شده.`,
      action:
        landingCount >= 3
          ? undefined
          : "برای سئوی محلی حداقل سه تا چهار صفحه «صنف + منطقه» بسازید.",
      owner: "you",
      blocking: false,
    });

    const postCount = await countRows("posts", "where published = true");
    checks.push({
      id: "posts",
      title: "مقالات وبلاگ",
      status: postCount >= 3 ? "ok" : "warn",
      detail: `${postCount} مقاله منتشر شده.`,
      action:
        postCount >= 3 ? undefined : "برای اینکه وبلاگ در گوگل دیده شود، حداقل سه مقاله لازم است.",
      owner: "you",
      blocking: false,
    });

    const adminCount = await countRows("admin_users");
    checks.push({
      id: "admins",
      title: "کاربران پنل",
      status: adminCount > 0 ? "ok" : "todo",
      detail: `${adminCount} کاربر تعریف شده.`,
      action: adminCount > 0 ? undefined : "با دستور npm run db:create-admin کاربر بسازید.",
      owner: "dev",
      blocking: true,
    });
  }

  // ---------------------------------------------------------- تحلیل
  const gtm = Boolean(process.env.NEXT_PUBLIC_GTM_ID);
  checks.push({
    id: "gtm",
    title: "گوگل تگ منیجر",
    status: gtm ? "ok" : "warn",
    detail: gtm
      ? "رویدادها به GTM فرستاده می‌شوند."
      : "تنظیم نشده. امتیازدهی و پاپ‌آپ سایت بدون آن هم کار می‌کنند؛ فقط گزارش‌های گوگل را ندارید.",
    action: gtm
      ? undefined
      : "اگر گزارش گوگل می‌خواهید، در tagmanager.google.com یک کانتینر بسازید و شناسه GTM-… را در NEXT_PUBLIC_GTM_ID بگذارید.",
    owner: "you",
    blocking: false,
  });

  return {
    checks,
    blockingCount: checks.filter((c) => c.blocking && c.status !== "ok").length,
    todoCount: checks.filter((c) => c.status !== "ok").length,
  };
}
