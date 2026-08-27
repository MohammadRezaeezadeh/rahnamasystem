import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

/**
 * فونت در زمان build دانلود و کنار سایت میزبانی می‌شود (self-host).
 * نتیجه: هیچ درخواستی به fonts.googleapis.com نمی‌رود — هم سریع‌تر، هم
 * برای کاربر ایرانی مطمئن‌تر. فقط ۴ وزنی که واقعاً استفاده می‌شود لود می‌شود.
 */
const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "نرم‌افزار حسابداری سپیدار",
    "سپیدار سیستم مشهد",
    "نمایندگی سپیدار خراسان",
    "نرم‌افزار دشت",
    "حسابداری شهرک صنعتی توس",
  ],
  authors: [{ name: site.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: site.name,
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    url: site.url,
  },
  robots: site.allowIndexing
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
    : { index: false, follow: false },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#43800c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      {/* هدر و فوتر اینجا نیستند: پنل مدیریت نباید پوسته سایت فروش را داشته باشد.
          پوسته عمومی در app/(site)/layout.tsx اعمال می‌شود. */}
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
