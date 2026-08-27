/**
 * بازه‌های زمانی آزاد برای رزرو تماس.
 *
 * ⚠️ منطقه زمانی مهم‌ترین نکته اینجاست. سرور روی لیارا احتمالاً UTC است،
 * ولی ساعت کاری دفتر به وقت تهران معنا دارد. اگر این تبدیل انجام نشود،
 * کاربر ساعت ۱۰ صبح رزرو می‌کند و در پنل ۶:۳۰ صبح دیده می‌شود.
 *
 * ایران از سال ۱۴۰۱ ساعت تابستانی را حذف کرده، پس اختلاف همیشه ثابت
 * +۰۳:۳۰ است و می‌توان مستقیم محاسبه کرد.
 */

const TEHRAN_OFFSET_MINUTES = 3 * 60 + 30;

/** ساعات کاری به وقت تهران. کلید = شماره روز در JS (۰ یکشنبه … ۶ شنبه) */
const WORKING_HOURS: Record<number, { open: number; close: number } | null> = {
  6: { open: 8, close: 17 }, // شنبه
  0: { open: 8, close: 17 }, // یکشنبه
  1: { open: 8, close: 17 }, // دوشنبه
  2: { open: 8, close: 17 }, // سه‌شنبه
  3: { open: 8, close: 17 }, // چهارشنبه
  4: { open: 8, close: 13 }, // پنجشنبه
  5: null, // جمعه تعطیل
};

const SLOT_MINUTES = 30;
/** کمترین فاصله تا زمان رزرو — کسی نباید برای ده دقیقه بعد وقت بگیرد */
const MIN_LEAD_HOURS = 3;
const DAYS_AHEAD = 14;

export type Slot = {
  /** لحظه دقیق به صورت ISO — همین در دیتابیس ذخیره می‌شود */
  iso: string;
  /** «۰۹:۰۰ تا ۰۹:۳۰» */
  timeLabel: string;
};

export type DayGroup = {
  /** «شنبه ۸ شهریور» */
  label: string;
  /** برای کلید React و مقایسه */
  key: string;
  slots: Slot[];
};

/** لحظه UTC متناظر با یک تاریخ و ساعت تهرانی */
function tehranToInstant(y: number, m: number, d: number, hour: number, minute: number): Date {
  return new Date(Date.UTC(y, m, d, hour, minute) - TEHRAN_OFFSET_MINUTES * 60_000);
}

/** اجزای تاریخ تهران برای یک لحظه */
function tehranParts(instant: Date) {
  const shifted = new Date(instant.getTime() + TEHRAN_OFFSET_MINUTES * 60_000);
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth(),
    d: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
  };
}

const dayFormatter = new Intl.DateTimeFormat("fa-IR", {
  timeZone: "Asia/Tehran",
  weekday: "long",
  day: "numeric",
  month: "long",
});

const timeFormatter = new Intl.DateTimeFormat("fa-IR", {
  timeZone: "Asia/Tehran",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** «شنبه ۸ شهریور» */
export function formatSlotDay(instant: Date | string): string {
  return dayFormatter.format(typeof instant === "string" ? new Date(instant) : instant);
}

/** «۰۹:۳۰» */
export function formatSlotTime(instant: Date | string): string {
  return timeFormatter.format(typeof instant === "string" ? new Date(instant) : instant);
}

/** «شنبه ۸ شهریور، ۰۹:۰۰ تا ۰۹:۳۰» */
export function formatSlotFull(instant: Date | string): string {
  const start = typeof instant === "string" ? new Date(instant) : instant;
  const end = new Date(start.getTime() + SLOT_MINUTES * 60_000);
  return `${formatSlotDay(start)}، ${formatSlotTime(start)} تا ${formatSlotTime(end)}`;
}

/**
 * بازه‌های آزاد، گروه‌بندی‌شده بر اساس روز.
 * @param booked لحظه‌هایی که قبلاً رزرو شده‌اند
 */
export function availableSlots(booked: Date[], now = new Date()): DayGroup[] {
  const taken = new Set(booked.map((b) => b.getTime()));
  const earliest = now.getTime() + MIN_LEAD_HOURS * 60 * 60_000;

  const groups: DayGroup[] = [];
  const today = tehranParts(now);

  for (let offset = 0; offset < DAYS_AHEAD; offset++) {
    // با UTC جلو می‌رویم تا سرریز ماه و سال خودکار درست شود
    const cursor = new Date(Date.UTC(today.y, today.m, today.d + offset));
    const y = cursor.getUTCFullYear();
    const m = cursor.getUTCMonth();
    const d = cursor.getUTCDate();
    const weekday = cursor.getUTCDay();

    const hours = WORKING_HOURS[weekday];
    if (!hours) continue;

    const slots: Slot[] = [];
    for (let minutes = hours.open * 60; minutes < hours.close * 60; minutes += SLOT_MINUTES) {
      const instant = tehranToInstant(y, m, d, Math.floor(minutes / 60), minutes % 60);
      if (instant.getTime() < earliest) continue;
      if (taken.has(instant.getTime())) continue;

      const end = new Date(instant.getTime() + SLOT_MINUTES * 60_000);
      slots.push({
        iso: instant.toISOString(),
        timeLabel: `${timeFormatter.format(instant)} تا ${timeFormatter.format(end)}`,
      });
    }

    if (slots.length) {
      const first = new Date(slots[0].iso);
      groups.push({ key: `${y}-${m + 1}-${d}`, label: dayFormatter.format(first), slots });
    }
  }

  return groups;
}

/**
 * بررسی اینکه یک زمان ارسالی واقعاً یک بازه معتبر است.
 * فرم سمت کاربر قابل دستکاری است، پس سرور نباید به آن اعتماد کند.
 */
export function isValidSlot(iso: string, now = new Date()): boolean {
  const instant = new Date(iso);
  if (Number.isNaN(instant.getTime())) return false;
  if (instant.getTime() < now.getTime() + MIN_LEAD_HOURS * 60 * 60_000) return false;

  const { weekday } = tehranParts(instant);
  const hours = WORKING_HOURS[weekday];
  if (!hours) return false;

  const shifted = new Date(instant.getTime() + TEHRAN_OFFSET_MINUTES * 60_000);
  const minutes = shifted.getUTCHours() * 60 + shifted.getUTCMinutes();

  if (minutes % SLOT_MINUTES !== 0) return false;
  return minutes >= hours.open * 60 && minutes < hours.close * 60;
}
