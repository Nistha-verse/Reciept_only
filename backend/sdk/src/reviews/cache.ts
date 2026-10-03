// Short-lived per-chain/read-key cache; successful posts invalidate all cached reads.
const entries = new Map<string, { until: number; value: unknown }>();
export function cached<T>(key: string): T | undefined {
  const e = entries.get(key);
  return e && e.until > Date.now() ? (e.value as T) : undefined;
}
export function cache<T>(key: string, value: T): T {
  if (entries.size >= 100) entries.clear();
  entries.set(key, { until: Date.now() + 5000, value });
  return value;
}
export function invalidate() {
  entries.clear();
}
