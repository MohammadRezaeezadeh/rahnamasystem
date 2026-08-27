/**
 * تزریق داده ساختاریافته به صفحه.
 * از dangerouslySetInnerHTML استفاده می‌شود چون گوگل باید JSON خام را ببیند؛
 * ورودی همیشه از توابع lib/schema.ts می‌آید و ورودی کاربر نیست.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\u003c"),
          }}
        />
      ))}
    </>
  );
}
