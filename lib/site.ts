/**
 * تنظیمات مرکزی کسب‌وکار.
 * هر جای سایت که نام، آدرس، تلفن یا ساعات کاری لازم باشد از اینجا خوانده می‌شود
 * تا تغییر اطلاعات فقط در یک فایل انجام شود (هدر، فوتر، schema.org، صفحه تماس).
 */

export const site = {
  name: "رهنما سیستم شرق",
  legalName: "مؤسسه حسابداری و خدمات مدیریت رهنما سیستم شرق",
  tagline: "نمایندگی رسمی سپیدار سیستم",
  description:
    "اولین نماینده نرم‌افزار حسابداری سپیدار و دشت همکاران سیستم در خراسان، با بیش از ۳۰ سال سابقه در پیاده‌سازی نرم‌افزارهای حسابداری. فروش، نصب، آموزش و پشتیبانی در مشهد.",

  /** نکات تمایز — در هیرو و schema استفاده می‌شود */
  credentials: {
    yearsOfExperience: 30,
    firstInRegion: "اولین نماینده سپیدار در خراسان",
  },

  /** آدرس عمومی سایت. با متغیر محیطی تنظیم می‌شود تا بعد از خرید دامنه فقط یک مقدار عوض شود. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),

  /** فقط وقتی true باشد گوگل اجازه ایندکس دارد. روی dev باید false بماند. */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",

  contact: {
    /** شماره اصلی — همیشه پاسخ داده می‌شود (دایورت روی موبایل) */
    primary: { label: "۰۵۱-۳۸۴۶۷۷۰۰", href: "tel:+985138467700" },
    /** دفتر شهرک صنعتی توس — ۵ خط */
    office: { label: "۰۵۱-۳۵۴۱۱۷۹۱ تا ۵", href: "tel:+985135411791" },
    mobiles: [
      { label: "۰۹۱۵۱۱۱۵۸۲۲", href: "tel:+989151115822" },
      { label: "۰۹۱۵۶۱۱۵۸۲۲", href: "tel:+989156115822" },
    ],
    /** فرمت بین‌المللی بدون + و بدون صفر ابتدا — برای لینک wa.me */
    whatsapp: "989151115822",
    whatsappLabel: "۰۹۱۵۱۱۱۵۸۲۲",
    email: "rahnamasystemco@gmail.com",
  },

  /** نماینده و مسئول فروش */
  representative: {
    name: "احمد رضائی‌زاده",
    role: "نماینده رسمی",
  },

  address: {
    street: "فاز یک شهرک صنعتی توس، حاشیه بلوار صنعت، ساختمان رایا، واحد ۳۰۲ غربی",
    streetShort: "شهرک صنعتی توس، ساختمان رایا",
    city: "مشهد",
    province: "خراسان رضوی",
    country: "IR",
    // TODO: کد پستی دفتر و مختصات دقیق نقشه هنوز تأیید نشده‌اند
    postalCode: "",
    geo: { lat: 36.3489, lng: 59.4372 },
  },

  /** ساعات کاری - در schema.org و صفحه تماس استفاده می‌شود */
  openingHours: [
    { days: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"], opens: "08:00", closes: "17:00" },
    { days: ["Thursday"], opens: "08:00", closes: "13:00" },
  ],
  openingHoursLabel: "شنبه تا چهارشنبه ۸ تا ۱۷ · پنجشنبه ۸ تا ۱۳",

  social: {
    instagram: "",
    telegram: "",
    linkedin: "",
  },
} as const;

/** لینک شروع گفتگوی واتساپ با متن آماده */
export function whatsappLink(message = "سلام، درباره نرم‌افزار سپیدار سؤال داشتم.") {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

export type Site = typeof site;
