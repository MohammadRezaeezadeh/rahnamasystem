-- =============================================================
-- ساختار دیتابیس رهنما سیستم شرق
--
-- این فایل idempotent است: هر بار اجرا شود، فقط چیزهای نبوده را می‌سازد.
-- اجرا:  npm run db:migrate
-- =============================================================

-- ---------- قیمت و توضیحات محصولات ----------
-- ساختار محصول (اسلاگ، نام، ترتیب) در lib/products.ts می‌ماند.
-- فقط چیزهایی که مدیر سایت باید بتواند بدون دیپلوی عوض کند اینجا هستند.
CREATE TABLE IF NOT EXISTS product_pricing (
  slug            TEXT PRIMARY KEY,
  -- قیمت به تومان. NULL یعنی «استعلام قیمت» — یعنی قیمت روی سایت نمایش داده نشود.
  price_toman     BIGINT,
  -- توضیح تکمیلی که مدیر می‌نویسد و زیر خلاصه محصول می‌نشیند
  description     TEXT,
  -- متن کوچک زیر قیمت، مثلاً «برای ۱ کاربر - بدون ماژول جانبی»
  price_note      TEXT,
  -- اگر false باشد دکمه خرید نمایش داده نمی‌شود و فقط مشاوره می‌ماند
  purchasable     BOOLEAN NOT NULL DEFAULT false,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- کاربران پنل مدیریت ----------
-- یک یا دو کاربر کافی است؛ عمداً سیستم نقش نداریم.
CREATE TABLE IF NOT EXISTS admin_users (
  id              SERIAL PRIMARY KEY,
  username        TEXT UNIQUE NOT NULL,
  -- scrypt: نمک و هش با هم، جدا شده با دونقطه. هیچ وابستگی بومی لازم ندارد.
  password_hash   TEXT NOT NULL,
  display_name    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at   TIMESTAMPTZ
);

-- ---------- سفارش‌ها ----------
CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  -- شناسه عمومی که در URL و کالبک استفاده می‌شود؛ id عددی را لو نمی‌دهد
  public_id       TEXT UNIQUE NOT NULL,
  product_slug    TEXT NOT NULL,
  product_name    TEXT NOT NULL,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  -- مبلغ به تومان، همان چیزی که به کاربر نشان داده شده
  amount_toman    BIGINT NOT NULL,
  -- zarinpal | snappay
  provider        TEXT NOT NULL,
  -- pending | paid | failed | canceled
  status          TEXT NOT NULL DEFAULT 'pending',
  -- شناسه‌ای که درگاه برمی‌گرداند (authority در زرین‌پال)
  provider_ref    TEXT,
  -- شماره پیگیری نهایی بعد از تأیید پرداخت
  payment_ref     TEXT,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS orders_status_idx     ON orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_provider_ref_idx ON orders (provider_ref);

-- ---------- سرنخ‌ها (فاز ۲ و ۵ پرش می‌کنند) ----------
CREATE TABLE IF NOT EXISTS leads (
  id              SERIAL PRIMARY KEY,
  name            TEXT,
  phone           TEXT,
  business_type   TEXT,
  message         TEXT,
  source          TEXT,
  -- در فاز ۵ امتیازدهی رفتاری اینجا می‌نشیند
  score           INTEGER NOT NULL DEFAULT 0,
  -- new | contacted | won | lost
  status          TEXT NOT NULL DEFAULT 'new',
  -- فرم‌های نیمه‌کاره هم ذخیره می‌شوند
  is_complete     BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status, created_at DESC);

-- =============================================================
-- فاز ۲ — مشاوره و رزرو تماس
-- =============================================================

-- ستون‌های جدید روی جدول موجود leads (اجرای چندباره بی‌خطر است)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS public_id      TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS product_slug   TEXT;
-- زمان تماسی که کاربر رزرو کرده؛ NULL یعنی «هر زمانی»
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_slot TIMESTAMPTZ;
-- آیا اعلان ایمیلی برای این سرنخ فرستاده شد؟ اگر false، تیم فروش باید
-- بداند که فقط در پنل دیده می‌شود و ایمیلی نرسیده است.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notified       BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ NOT NULL DEFAULT now();

-- یک بازه زمانی نباید دوبار رزرو شود.
-- ایندکس جزئی است: رزروهای لغوشده جا را اشغال نمی‌کنند.
CREATE UNIQUE INDEX IF NOT EXISTS leads_slot_unique
  ON leads (preferred_slot)
  WHERE preferred_slot IS NOT NULL AND status <> 'canceled';

CREATE INDEX IF NOT EXISTS leads_slot_idx ON leads (preferred_slot)
  WHERE preferred_slot IS NOT NULL;
