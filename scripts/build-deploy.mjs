/**
 * ساخت خروجی آماده‌ی استقرار.
 *
 *   npm run build:deploy
 *
 * چرا build اینجا انجام می‌شود و نه روی لیارا: پلن سرور ۵۱۲ مگابایت رم
 * دارد و npm آنجا موقع استخراج ۴۳۱ مگابایت node_modules کشته می‌شود
 * («Exit handler never called!»). پس build روی همین ماشین انجام می‌شود و
 * فقط پوشه‌ی deploy/ (حدود ۲۳ مگابایت) به سرور می‌رود.
 *
 * نکته‌ی مهم: متغیرهای NEXT_PUBLIC_* موقع build داخل خروجی «پخته»
 * می‌شوند. تا وقتی لیارا خودش build می‌کرد، مقادیر را از پنل می‌گرفت.
 * حالا که build محلی است، اگر جلویش را نگیریم مقادیر .env.local (یعنی
 * localhost) در sitemap و canonical سایت زنده می‌نشیند. برای همین این
 * اسکریپت مقادیر production را از .env.deploy می‌خواند و مستقیم در
 * process.env می‌گذارد — که در Next بر همه‌ی فایل‌های .env اولویت دارد.
 */
import { existsSync, rmSync, cpSync, mkdirSync, readdirSync, statSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { zipDirectory } from "./zip.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "deploy");
const require = createRequire(import.meta.url);

function fail(msg, ...rest) {
  console.error("✗ " + msg);
  for (const r of rest) console.error("  " + r);
  process.exit(1);
}

// ── ۱) مقادیر production ─────────────────────────────────────────────
const envFile = join(root, ".env.deploy");
if (!existsSync(envFile)) {
  fail(".env.deploy پیدا نشد.", "این فایل مقادیر عمومی production را نگه می‌دارد. نمونه‌اش در گیت هست.");
}

const deployEnv = {};
for (const line of readFileSync(envFile, "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) deployEnv[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const siteUrl = deployEnv.NEXT_PUBLIC_SITE_URL;
if (!siteUrl || /localhost|127\.0\.0\.1/.test(siteUrl)) {
  fail("NEXT_PUBLIC_SITE_URL در .env.deploy آدرس production نیست.", `مقدار فعلی: ${siteUrl || "(خالی)"}`);
}

console.log(`» build با NEXT_PUBLIC_SITE_URL=${siteUrl}`);
console.log(`» NEXT_PUBLIC_ALLOW_INDEXING=${deployEnv.NEXT_PUBLIC_ALLOW_INDEXING}`);

// ── ۲) build ─────────────────────────────────────────────────────────
rmSync(join(root, ".next"), { recursive: true, force: true });
const build = spawnSync(process.execPath, [require.resolve("next/dist/bin/next"), "build"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, ...deployEnv, NODE_ENV: "production" },
});
if (build.status !== 0) fail("`next build` شکست خورد.");

const standalone = join(root, ".next", "standalone");
if (!existsSync(join(standalone, "server.js"))) fail("خروجی standalone ساخته نشد.");

// ── ۳) چیدن قطعات کنار هم ────────────────────────────────────────────
// Next خروجی را در سه جای جدا می‌گذارد و خودش آن‌ها را جمع نمی‌کند.
rmSync(out, { recursive: true, force: true });
cpSync(standalone, out, { recursive: true });
cpSync(join(root, ".next", "static"), join(out, ".next", "static"), { recursive: true });
if (existsSync(join(root, "public"))) {
  cpSync(join(root, "public"), join(out, "public"), { recursive: true });
}

// اسکریپت‌های دیتابیس، تا روی سرور بشود `npm run db:migrate` زد.
// migrate.mjs فایل schema را از ../lib/db/ می‌خواند، پس آن هم لازم است.
mkdirSync(join(out, "lib", "db"), { recursive: true });
cpSync(join(root, "scripts"), join(out, "scripts"), { recursive: true });
cpSync(join(root, "lib", "db", "schema.sql"), join(out, "lib", "db", "schema.sql"));

// ── ۴) حذف sharp ─────────────────────────────────────────────────────
// sharp یک optionalDependency خود Next است و فقط برای next/image لازم
// می‌شود؛ این پروژه هیچ‌جا از آن استفاده نمی‌کند. مهم‌تر از حجمش این است
// که نسخه‌ی ویندوزیِ باینری داخل bundle می‌آید و روی لینوکس بی‌مصرف
// است. Next نبودنش را با try/catch می‌پذیرد.
// detect-libc و semver فقط وابسته‌های خود sharp بودند.
for (const p of ["sharp", "@img", "detect-libc", "semver"]) {
  rmSync(join(out, "node_modules", p), { recursive: true, force: true });
}

// ── ۵) بررسی‌های نهایی ───────────────────────────────────────────────
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else files.push(full);
  }
})(out);

// باینری بومی نباید بماند: bundle روی ویندوز ساخته می‌شود و روی لینوکس
// اجرا؛ هر فایل .node یعنی خروجی به پلتفرم گره خورده است.
const native = files.filter((f) => f.endsWith(".node"));
if (native.length) {
  fail("باینری بومی در خروجی ماند — روی لینوکس اجرا نمی‌شود:", ...native.map((f) => f.slice(out.length + 1)));
}

// آدرس dev نباید در خروجی خود اپ پخته شده باشد.
// node_modules کنار گذاشته می‌شود: فایل‌های داخلی Next (edge-runtime و
// clean-url) ذاتاً رشته‌ی localhost دارند و ربطی به تنظیمات ما ندارند.
const ownOutput = files.filter((f) => !f.slice(out.length).includes("node_modules"));
const leaked = ownOutput.filter((f) => {
  if (statSync(f).size > 8e6) return false;
  return /localhost:\d+|127\.0\.0\.1:\d+/.test(readFileSync(f, "latin1"));
});
if (leaked.length) {
  fail(
    `آدرس محلی در ${leaked.length} فایل خروجی پخته شده — sitemap و canonical خراب می‌شوند.`,
    ...leaked.slice(0, 5).map((f) => f.slice(out.length + 1)),
  );
}

// رازهای .env.local نباید به خروجی راه پیدا کرده باشند.
const envLocal = join(root, ".env.local");
if (existsSync(envLocal)) {
  const secretNames = /SECRET|KEY|PASS|MERCHANT|DATABASE_URL/;
  const secrets = [];
  for (const line of readFileSync(envLocal, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && secretNames.test(m[1])) {
      const v = m[2].replace(/^["']|["']$/g, "");
      if (v.length >= 8) secrets.push([m[1], v]);
    }
  }
  for (const f of files) {
    if (statSync(f).size > 8e6) continue;
    const content = readFileSync(f, "latin1");
    for (const [name, value] of secrets) {
      if (content.includes(value)) fail(`راز ${name} در خروجی نشت کرده: ${f.slice(out.length + 1)}`);
    }
  }
}

const bytes = files.reduce((t, f) => t + statSync(f).size, 0);
console.log(`\n✓ deploy/ آماده است — ${(bytes / 1024 / 1024).toFixed(1)} مگابایت (سقف پلن: ۱۲۸)`);

// ── ۶) بسته‌ی zip برای آپلود از پنل لیارا ────────────────────────────
// اگر liara CLI نصب نباشد، استقرار از طریق پنل با آپلود zip انجام
// می‌شود. محتوای zip دقیقاً همان چیزی است که build لازم دارد و نه یک
// بایت بیشتر — اگر کل پوشه‌ی پروژه zip شود، node_modules با ۴۳۱
// مگابایت از سقف ۱۲۸ مگابایتی پلن رد می‌شود.
const stage = join(root, ".deploy-zip");
const zipPath = join(root, "rahnama-deploy.zip");
rmSync(stage, { recursive: true, force: true });
rmSync(zipPath, { force: true });
mkdirSync(stage, { recursive: true });
cpSync(out, join(stage, "deploy"), { recursive: true });
cpSync(join(root, "Dockerfile"), join(stage, "Dockerfile"));
cpSync(join(root, "liara.json"), join(stage, "liara.json"));

const { count, bytes: zipBytes } = zipDirectory(stage, zipPath);
rmSync(stage, { recursive: true, force: true });

console.log(`✓ rahnama-deploy.zip — ${(zipBytes / 1024 / 1024).toFixed(1)} مگابایت، ${count} فایل`);

console.log("");
console.log("استقرار:");
console.log("  با CLI : liara deploy");
console.log("  با پنل : فایل rahnama-deploy.zip را در پنل لیارا آپلود کن");
