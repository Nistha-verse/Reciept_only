// Only reviewed, fixed provider subject templates can produce merchant names.
import type { Provider } from "../config/providers.js";
export function extractMerchant(subject: string, provider: Provider): string {
  const match = provider.merchantSubjectPattern?.exec(subject);
  const merchant = match?.groups?.merchant?.trim().replace(/\s+/g, " ");
  return merchant && merchant.length <= 120 && !/[\x00-\x1f<>]/.test(merchant)
    ? merchant
    : provider.fallback;
}
