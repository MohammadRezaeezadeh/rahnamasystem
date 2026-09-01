/**
 * ساخت فایل zip، فقط با ماژول‌های خود Node.
 *
 * چرا دستی: نه `zip` روی این ماشین هست و نه tarِ گیت‌بش فرمت zip
 * می‌سازد، و ZipFile::CreateFromDirectory ویندوز مسیرها را با بک‌اسلش
 * می‌نویسد — چنین فایلی روی لینوکس (سرور build لیارا) به‌جای پوشه،
 * فایل‌هایی با نام «deploy\.next\...» باز می‌کند و build می‌شکند.
 *
 * اینجا نام هر ورودی صریحاً با / نوشته می‌شود.
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateRawSync } from "node:zlib";

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

/** تاریخ و ساعت به قالب DOS که فرمت zip می‌خواهد */
function dosStamp(d) {
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time, date };
}

function listFiles(dir, prefix = "") {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    // نام داخل zip همیشه با / — این همان چیزی است که روی لینوکس لازم است
    const rel = prefix ? `${prefix}/${name}` : name;
    if (statSync(full).isDirectory()) out.push(...listFiles(full, rel));
    else out.push({ full, rel });
  }
  return out;
}

/**
 * محتوای پوشه‌ی sourceDir را در zipPath می‌نویسد.
 * برمی‌گرداند: تعداد فایل‌ها و حجم نهایی.
 */
export function zipDirectory(sourceDir, zipPath) {
  const files = listFiles(sourceDir);
  const chunks = [];
  const central = [];
  let offset = 0;

  for (const { full, rel } of files) {
    const raw = readFileSync(full);
    const deflated = deflateRawSync(raw, { level: 9 });
    // اگر فشرده‌سازی کمکی نکرد، خام ذخیره کن (روش ۰)
    const useStore = deflated.length >= raw.length;
    const body = useStore ? raw : deflated;
    const method = useStore ? 0 : 8;
    const crc = crc32(raw);
    const name = Buffer.from(rel, "utf8");
    const { time, date } = dosStamp(statSync(full).mtime);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // نسخه‌ی لازم
    local.writeUInt16LE(0x800, 6); // پرچم: نام‌ها UTF-8 هستند
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);

    chunks.push(local, name, body);

    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0x800, 8);
    cd.writeUInt16LE(method, 10);
    cd.writeUInt16LE(time, 12);
    cd.writeUInt16LE(date, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(body.length, 20);
    cd.writeUInt32LE(raw.length, 24);
    cd.writeUInt16LE(name.length, 28);
    cd.writeUInt32LE(0o644 << 16, 38); // دسترسی یونیکسی، برای استخراج روی لینوکس
    cd.writeUInt32LE(offset, 42);
    central.push(cd, name);

    offset += local.length + name.length + body.length;
  }

  const cdBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cdBuf.length, 12);
  end.writeUInt32LE(offset, 16);

  const zip = Buffer.concat([...chunks, cdBuf, end]);
  writeFileSync(zipPath, zip);
  return { count: files.length, bytes: zip.length };
}
