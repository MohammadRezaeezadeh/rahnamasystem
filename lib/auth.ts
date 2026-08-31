import "server-only";
import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { queryOne, query } from "./db";

/**
 * ورود به پنل مدیریت.
 *
 * عمداً ساده نگه داشته شده: یک یا دو کاربر، بدون سیستم نقش.
 * هیچ کتابخانه‌ی بیرونی لازم نیست — نه bcrypt (که کامپایل بومی می‌خواهد و
 * روی لیارا دردسر می‌شود) و نه کتابخانه JWT. فقط node:crypto.
 *
 * رمز با scrypt هش می‌شود و کوکی نشست با HMAC امضا می‌شود.
 */

const scryptAsync = promisify(scrypt);

const COOKIE_NAME = "rahnama_admin";
const SESSION_DAYS = 7;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "AUTH_SECRET باید حداقل ۳۲ کاراکتر باشد. با دستور زیر یکی بسازید:\n" +
        "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }
  return s;
}

// ---------------------------------------------------------------- رمز عبور

/** ساخت هش رمز: نمک و کلید با دونقطه جدا می‌شوند */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

/** بررسی رمز — مقایسه با timingSafeEqual تا زمان پاسخ اطلاعات لو ندهد */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(key, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

// ---------------------------------------------------------------- نشست

type SessionPayload = { uid: number; exp: number };

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

function encodeSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(token: string): SessionPayload | null {
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;

  const expected = sign(body);
  // طول برابر لازم است وگرنه timingSafeEqual خطا می‌دهد
  if (mac.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (typeof payload.uid !== "number" || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export type AdminUser = { id: number; username: string; display_name: string | null };

/** تلاش برای ورود. در صورت موفقیت کوکی نشست ست می‌شود. */
export async function login(username: string, password: string): Promise<AdminUser | null> {
  const user = await queryOne<AdminUser & { password_hash: string }>(
    "select id, username, display_name, password_hash from admin_users where username = $1",
    [username.trim().toLowerCase()],
  );

  // حتی وقتی کاربر وجود ندارد یک هش الکی بررسی می‌کنیم تا زمان پاسخ یکسان بماند
  const stored = user?.password_hash ?? `${"0".repeat(32)}:${"0".repeat(128)}`;
  const ok = await verifyPassword(password, stored);
  if (!user || !ok) return null;

  await query("update admin_users set last_login_at = now() where id = $1", [user.id]);

  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const jar = await cookies();
  jar.set(COOKIE_NAME, encodeSession({ uid: user.id, exp }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(exp),
  });

  return { id: user.id, username: user.username, display_name: user.display_name };
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

/** کاربر فعلی، یا null اگر وارد نشده باشد */
export async function currentUser(): Promise<AdminUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = decodeSession(token);
  if (!payload) return null;

  return queryOne<AdminUser>(
    "select id, username, display_name from admin_users where id = $1",
    [payload.uid],
  );
}

/** آیا اصلاً کاربری ساخته شده؟ برای راهنمایی در صفحه ورود */
export async function hasAnyAdmin(): Promise<boolean> {
  const row = await queryOne<{ count: string }>("select count(*)::text as count from admin_users");
  return Number(row?.count ?? 0) > 0;
}

// ---------------------------------------------------------------- مدیریت کاربر

/** فهرست کاربران پنل — برای صفحه تنظیمات */
export async function listAdmins(): Promise<
  (AdminUser & { created_at: string; last_login_at: string | null })[]
> {
  return query<AdminUser & { created_at: string; last_login_at: string | null }>(
    "select id, username, display_name, created_at, last_login_at from admin_users order by id",
  );
}

/**
 * تغییر رمز کاربر فعلی.
 * رمز فعلی هم خواسته می‌شود: اگر کسی پشت سیستمِ بازمانده بنشیند، نتواند
 * بدون دانستن رمز، حساب را از دست صاحبش خارج کند.
 */
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (newPassword.length < 8) {
    return { ok: false, error: "رمز جدید باید حداقل ۸ کاراکتر باشد." };
  }

  const row = await queryOne<{ password_hash: string }>(
    "select password_hash from admin_users where id = $1",
    [userId],
  );
  if (!row) return { ok: false, error: "کاربر پیدا نشد." };

  if (!(await verifyPassword(currentPassword, row.password_hash))) {
    return { ok: false, error: "رمز فعلی اشتباه است." };
  }

  await query("update admin_users set password_hash = $2 where id = $1", [
    userId,
    await hashPassword(newPassword),
  ]);
  return { ok: true };
}

/** افزودن کاربر دوم — عمداً بدون سیستم نقش، هر دو دسترسی یکسان دارند */
export async function addAdmin(
  username: string,
  password: string,
  displayName: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const clean = username.trim().toLowerCase();

  if (!/^[a-z0-9._-]{3,40}$/.test(clean)) {
    return { ok: false, error: "نام کاربری فقط حروف کوچک انگلیسی، عدد، نقطه و خط تیره — ۳ تا ۴۰ کاراکتر." };
  }
  if (password.length < 8) {
    return { ok: false, error: "رمز باید حداقل ۸ کاراکتر باشد." };
  }

  const existing = await queryOne<{ id: number }>(
    "select id from admin_users where username = $1",
    [clean],
  );
  if (existing) return { ok: false, error: "این نام کاربری قبلاً ثبت شده است." };

  await query(
    "insert into admin_users (username, password_hash, display_name) values ($1, $2, $3)",
    [clean, await hashPassword(password), displayName?.trim() || null],
  );
  return { ok: true };
}
