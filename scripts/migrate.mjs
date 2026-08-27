/**
 * اجرای ساختار دیتابیس.
 *
 *   npm run db:migrate
 *
 * فایل lib/db/schema.sql را اجرا می‌کند. چون همه دستورات IF NOT EXISTS
 * هستند، اجرای چندباره بی‌خطر است.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const here = dirname(fileURLToPath(import.meta.url));

// خواندن .env.local بدون وابستگی اضافه
function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(join(here, "..", file), "utf8");
      for (const line of raw.split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
        }
      }
    } catch {
      /* فایل وجود ندارد - اشکالی ندارد */
    }
  }
}

function ssl() {
  const mode = process.env.DATABASE_SSL ?? "off";
  if (mode === "off") return false;
  if (mode === "strict") return { rejectUnauthorized: true };
  if (mode === "relax") return { rejectUnauthorized: false };
  throw new Error(`DATABASE_SSL نامعتبر: ${mode}`);
}

loadEnv();

if (!process.env.DATABASE_URL) {
  console.error("✗ DATABASE_URL تنظیم نشده. فایل .env.local را بررسی کنید.");
  process.exit(1);
}

const sql = readFileSync(join(here, "..", "lib", "db", "schema.sql"), "utf8");
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: ssl(),
  connectionTimeoutMillis: 15_000,
});

try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    "select table_name from information_schema.tables where table_schema='public' order by table_name",
  );
  console.log("✓ ساختار دیتابیس اعمال شد");
  console.log("  جداول:", rows.map((r) => r.table_name).join(", "));
} catch (err) {
  console.error("✗ خطا در اجرای ساختار:", err.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
