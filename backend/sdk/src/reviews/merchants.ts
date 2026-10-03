// Local display-name registry: event hashes alone cannot reveal merchant names.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Hex } from "viem";
import { ROOT } from "../config/env.js";
import { merchantHash } from "../utils/hash.js";
import { providers } from "../config/providers.js";
const path = join(ROOT, "backend/.merchant-registry.json");
const names = new Map<string, string>(
  providers.map((p) => [merchantHash(p.fallback), p.fallback]),
);
try {
  const stored = JSON.parse(readFileSync(path, "utf8"));
  for (const [id, name] of Object.entries(stored))
    if (
      typeof name === "string" &&
      name.length <= 120 &&
      merchantHash(name) === id
    )
      names.set(id, name);
} catch {
  /* Optional local display names; never required for chain integrity. */
}
export function rememberMerchant(id: Hex, name: string) {
  if (name.length > 120 || merchantHash(name) !== id) return;
  names.set(id, name);
  try {
    writeFileSync(path, JSON.stringify(Object.fromEntries(names)), {
      mode: 0o600,
    });
  } catch {
    /* Display-name persistence is best effort. */
  }
}
export const merchantName = (id: Hex) =>
  names.get(id) ?? `${id.slice(0, 10)}…${id.slice(-4)}`;
