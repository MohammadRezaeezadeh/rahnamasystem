/**
 * ساخت کاربر پنل مدیریت.
 *
 *   npm run db:create-admin -- <نام‌کاربری> <رمز> ["نام نمایشی"]
 *
 * اگر نام کاربری تکراری باشد، رمزش به‌روز می‌شود (برای بازیابی رمز فراموش‌شده).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import pg from "pg";

const scryptAsync = promisify(scrypt);
const here = dirname(fileURLToPath(import.meta.url));

for (const file of [".env.local", ".env"]) {
  try {
    const raw = readFileSync(join(here, "..", file), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* اختیاری */
  }
}

const [username, password, displayName] = process.argv.slice(2);

if (!username || !password) {
  console.error("استفاده: npm run db:create-admin -- <نام‌کاربری> <رمز> [\"نام نمایشی\"]");
  process.exit(1);
}
if (password.length < 8) {
  console.error("✗ رمز عبور باید حداقل ۸ کاراکتر باشد.");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("✗ DATABASE_URL تنظیم نشده.");
  process.exit(1);
}

function ssl() {
  const mode = process.env.DATABASE_SSL ?? "off";
  if (mode === "off") return false;
  if (mode === "strict") return { rejectUnauthorized: true };
  if (mode === "relax") return { rejectUnauthorized: false };
  throw new Error(`DATABASE_SSL نامعتبر: ${mode}`);
}

const salt = randomBytes(16).toString("hex");
const derived = await scryptAsync(password, salt, 64);
const hash = `${salt}:${derived.toString("hex")}`;

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: ssl(),
  connectionTimeoutMillis: 15_000,
});

try {
  await client.connect();
  await client.query(
    `insert into admin_users (username, password_hash, display_name)
     values ($1, $2, $3)
     on conflict (username) do update
       set password_hash = excluded.password_hash,
           display_name  = coalesce(excluded.display_name, admin_users.display_name)`,
    [username.trim().toLowerCase(), hash, displayName ?? null],
  );
  console.log(`✓ کاربر «${username}» آماده است. حالا به /admin/login بروید.`);
} catch (err) {
  console.error("✗ خطا:", err.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
