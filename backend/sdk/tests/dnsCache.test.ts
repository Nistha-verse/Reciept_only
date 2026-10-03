// Online cache fill, explicit offline reuse, expiry refresh and cache miss.
import { it, expect } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDnsResolver, readDnsCache } from "../src/verify/dnsCache.js";
import { synthetic, NOW } from "./fixtures/synthetic.js";
import { verifyReceipt } from "../src/verify/verifyReceipt.js";
it("caches locally and makes zero network calls offline", async () => {
  const dir = mkdtempSync(join(tmpdir(), "receipts-dns-")),
    path = join(dir, "keys.json");
  let calls = 0;
  const upstream = async () => {
    calls++;
    return [["v=DKIM1; p=synthetic"]];
  };
  try {
    const query = "synthetic._domainkey.zomato.com";
    await createDnsResolver({ path, upstream, now: () => 0 })(query, "TXT");
    expect(
      await createDnsResolver({ path, offline: true, upstream })(query, "TXT"),
    ).toEqual([["v=DKIM1; p=synthetic"]]);
    expect(calls).toBe(1);
    await createDnsResolver({ path, upstream, now: () => 86400001 })(
      query,
      "TXT",
    );
    expect(calls).toBe(2);
    await expect(
      createDnsResolver({ path, offline: true })(
        "absent._domainkey.zomato.com",
        "TXT",
      ),
    ).rejects.toMatchObject({ code: "EOFFLINE" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
it("preserves both keys after concurrent network lookups", async () => {
  const dir = mkdtempSync(join(tmpdir(), "receipts-dns-parallel-"));
  const path = join(dir, "keys.json");
  try {
    const resolver = createDnsResolver({
      path,
      upstream: async (name) => {
        await new Promise((r) => setTimeout(r, 1));
        return [[`synthetic-key:${name}`]];
      },
    });
    await Promise.all([
      resolver("one._domainkey.zomato.com", "TXT"),
      resolver("two._domainkey.zomato.com", "TXT"),
    ]);
    expect(Object.keys(readDnsCache(path))).toHaveLength(2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
it("verifies a signed fixture offline using its previously cached public key", async () => {
  const dir = mkdtempSync(join(tmpdir(), "receipts-offline-"));
  const path = join(dir, "keys.json");
  try {
    const f = await synthetic();
    const online = await verifyReceipt(f.raw, {
      resolver: createDnsResolver({ path, upstream: f.resolver }),
      now: () => NOW,
    });
    const offline = await verifyReceipt(f.raw, {
      offline: true,
      dnsCachePath: path,
      now: () => NOW,
    });
    expect(offline).toEqual(online);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
