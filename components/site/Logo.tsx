import Link from "next/link";
import { site } from "@/lib/site";
import { LogoMark, logoOnDark } from "./LogoMark";

export function Logo({
  compact = false,
  onDark = false,
}: {
  compact?: boolean;
  /** روی پس‌زمینه تیره، بلوک‌های مشکی نشان دیده نمی‌شوند و باید سفید شوند */
  onDark?: boolean;
}) {
  return (
    <Link href="/" className="flex min-h-11 min-w-0 items-center gap-2.5" aria-label={`${site.name} - صفحه اصلی`}>
      <LogoMark className="h-9 w-auto shrink-0" colors={onDark ? logoOnDark : undefined} />
      {!compact && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className={`truncate text-[0.95rem] font-bold ${onDark ? "text-white" : "text-ink-900"}`}>
            {site.name}
          </span>
          {/* شعار در موبایل جا نمی‌شود و هدر را سرریز می‌کند */}
          <span
            className={`hidden truncate text-[0.7rem] font-medium sm:block ${
              onDark ? "text-brand-300" : "text-brand-700"
            }`}
          >
            {site.tagline}
          </span>
        </span>
      )}
    </Link>
  );
}
