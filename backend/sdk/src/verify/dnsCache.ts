// Local public-key cache: online refresh after 24h; explicit offline mode uses saved keys.
import { resolveTxt } from "node:dns/promises";
import { mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { ROOT } from "../config/env.js";
import type { DnsResolver } from "../types/email.js";
export const defaultDnsCachePath = join(ROOT, ".dkim-cache", "keys.json");
type Cache = Record<string, { records: string[][]; savedAt: number }>;
export function readDnsCache(path = defaultDnsCachePath): Cache {
  try {
    const value = JSON.parse(readFileSync(path, "utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter(
        ([, v]: [string, any]) =>
          Number.isFinite(v?.savedAt) &&
          Array.isArray(v?.records) &&
          v.records.every(
            (r: unknown) =>
              Array.isArray(r) && r.every((s) => typeof s === "string"),
          ),
      ),
    ) as Cache;
  } catch {
    return {};
  }
}
export function createDnsResolver(
  options: {
    offline?: boolean;
    path?: string;
    upstream?: DnsResolver;
    now?: () => number;
  } = {},
): DnsResolver {
  const path = options.path ?? defaultDnsCachePath;
  return async (name, type) => {
    if (
      type !== "TXT" ||
      !/^[a-zA-Z0-9_.-]+\._domainkey\.[a-zA-Z0-9.-]+$/.test(name)
    )
      throw Object.assign(new Error("DNS query refused"), {
        code: "ENOTFOUND",
      });
    const id = name.toLowerCase(),
      cache = readDnsCache(path),
      now = options.now?.() ?? Date.now();
    const entry = cache[id];
    if (entry && (options.offline || now - entry.savedAt < 86400000))
      return entry.records;
    if (options.offline)
      throw Object.assign(new Error("Offline cache miss"), {
        code: "EOFFLINE",
      });
    const records = options.upstream
      ? await options.upstream(name, type)
      : await resolveTxt(name);
    if (!records.length)
      throw Object.assign(new Error("No key"), { code: "ENODATA" });
    cache[id] = { records, savedAt: now };
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    const temporary = `${path}.${process.pid}.tmp`;
    writeFileSync(temporary, JSON.stringify(cache), { mode: 0o600 });
    renameSync(temporary, path);
    return records;
  };
}
