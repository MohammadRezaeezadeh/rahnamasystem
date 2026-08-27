import { SiteChrome } from "@/components/site/SiteChrome";

/**
 * چیدمان سایت عمومی.
 * این گروه مسیر (site) روی URL اثری ندارد — /products همان /products می‌ماند.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
