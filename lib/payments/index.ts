import "server-only";
import type { PaymentProvider, ProviderId } from "./types";
import { zarinpal } from "./zarinpal";
import { snappay } from "./snappay";

export * from "./types";

const providers: Record<ProviderId, PaymentProvider> = { zarinpal, snappay };

export function getProvider(id: string): PaymentProvider | null {
  return providers[id as ProviderId] ?? null;
}

/** فقط درگاه‌هایی که کلیدهایشان ست شده — بقیه در صفحه تسویه دیده نمی‌شوند */
export function availableProviders(): PaymentProvider[] {
  return Object.values(providers).filter((p) => p.isConfigured());
}

/** آیا اصلاً پرداخت آنلاین ممکن است؟ اگر نه، صفحه محصول فقط مشاوره پیشنهاد می‌دهد */
export function isAnyProviderReady(): boolean {
  return availableProviders().length > 0;
}
