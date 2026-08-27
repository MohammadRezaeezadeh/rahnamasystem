import { Pool, type QueryResultRow } from "pg";

/**
 * اتصال به پستگرس.
 *
 * در حالت توسعه، Next ماژول‌ها را بین ری‌لودها دوباره ارزیابی می‌کند؛ اگر
 * Pool را در globalThis نگه نداریم هر بار یک استخر اتصال جدید ساخته می‌شود و
 * خیلی زود سقف اتصال دیتابیس پر می‌شود.
 */

declare global {
  var __rahnamaPool: Pool | undefined;
}

/**
 * تنظیم SSL.
 *
 * دیتابیس‌های لیارا گواهی self-signed دارند، پس اعتبارسنجی گواهی روی آن‌ها
 * شکست می‌خورد. مقدار DATABASE_SSL را صریح تعیین کنید تا این انتخاب آگاهانه
 * باشد، نه یک پیش‌فرض پنهان:
 *   strict → گواهی اعتبارسنجی می‌شود (امن‌ترین، اگر CA معتبر دارید)
 *   relax  → رمزگذاری هست ولی گواهی بررسی نمی‌شود (حالت معمول لیارا)
 *   off    → بدون SSL (فقط برای پستگرس محلی)
 */
function sslConfig() {
  const mode = process.env.DATABASE_SSL ?? "off";
  if (mode === "off") return false;
  if (mode === "strict") return { rejectUnauthorized: true };
  if (mode === "relax") return { rejectUnauthorized: false };
  throw new Error(`DATABASE_SSL نامعتبر است: "${mode}" — یکی از off | relax | strict`);
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL تنظیم نشده است. فایل .env.local را بررسی کنید.");
  }
  return new Pool({
    connectionString,
    ssl: sslConfig(),
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export function getPool(): Pool {
  if (process.env.NODE_ENV === "production") {
    global.__rahnamaPool ??= createPool();
    return global.__rahnamaPool;
  }
  global.__rahnamaPool ??= createPool();
  return global.__rahnamaPool;
}

/** اجرای کوئری با پارامتر — همیشه از $1,$2 استفاده کنید، هرگز رشته را به هم نچسبانید */
export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

/** کوئری‌ای که حداکثر یک ردیف برمی‌گرداند */
export async function queryOne<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** آیا دیتابیس اصلاً پیکربندی شده؟ صفحات باید بدون دیتابیس هم بالا بیایند */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
