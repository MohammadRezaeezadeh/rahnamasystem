import Script from "next/script";

/**
 * گوگل تگ منیجر — اختیاری.
 *
 * اگر NEXT_PUBLIC_GTM_ID خالی باشد هیچ اسکریپتی لود نمی‌شود و سایت
 * دقیقاً همان‌قدر سریع می‌ماند.
 *
 * ⚠️ نکته‌ای که باید بدانید: اسکریپت گوگل در ایران گاهی کند یا در دسترس
 * نیست. به همین دلیل امتیازدهی و پاپ‌آپ سایت به آن وابسته نیستند —
 * GTM فقط رویدادهایی را که خودمان در dataLayer می‌گذاریم مصرف می‌کند.
 * اگر لود نشود، فقط گزارش‌های گوگل از دست می‌رود، نه سرنخ‌ها.
 *
 * strategy="afterInteractive" یعنی بعد از تعاملی‌شدن صفحه لود می‌شود و
 * روی سرعت نمایش اولیه اثری ندارد.
 */
export function Analytics() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  if (!gtmId) return null;

  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
      </Script>

      {/* نسخه بدون جاوااسکریپت — گوگل توصیه‌اش می‌کند */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
