import { whatsappLink } from "@/lib/site";

const WHATSAPP_GREEN = "#25D366";

export function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.6-.92-2.2-.24-.57-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.8h-.02a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.79 9.79 0 0 1-1.5-5.23c0-5.41 4.41-9.81 9.83-9.81 2.62 0 5.09 1.02 6.94 2.88a9.75 9.75 0 0 1 2.87 6.94c0 5.41-4.4 9.82-9.82 9.82M20.52 3.45A11.68 11.68 0 0 0 12.05 0C5.6 0 .35 5.25.34 11.7c0 2.06.54 4.08 1.56 5.85L.24 24l6.6-1.73a11.7 11.7 0 0 0 5.2 1.24h.01c6.45 0 11.7-5.25 11.7-11.7a11.6 11.6 0 0 0-3.43-8.31" />
    </svg>
  );
}

/**
 * دکمه گفتگو در واتساپ.
 *
 * پیام از پیش نوشته می‌شود تا کاربر لازم نباشد چیزی تایپ کند و تیم فروش
 * بلافاصله بداند درباره کدام محصول سؤال شده. این کوتاه‌ترین مسیر تبدیل
 * در کل سایت است، پس در صفحه محصول بالاتر از دکمه مشاوره می‌نشیند.
 */
export function WhatsAppButton({
  message,
  label = "گفتگو در واتساپ",
  variant = "solid",
  className = "",
}: {
  message?: string;
  label?: string;
  variant?: "solid" | "outline";
  className?: string;
}) {
  const base =
    "flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-colors";

  const style =
    variant === "solid"
      ? { backgroundColor: WHATSAPP_GREEN, color: "#fff" }
      : { borderColor: WHATSAPP_GREEN, color: "#128C4A" };

  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      data-analytics="whatsapp-click"
      className={`${base} ${variant === "outline" ? "border bg-white hover:bg-[#f0fdf4]" : "hover:brightness-95"} ${className}`}
      style={style}
    >
      <WhatsAppIcon />
      {label}
    </a>
  );
}
