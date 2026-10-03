// Online cache fill, explicit offline reuse, expiry refresh and cache miss.
import { it, expect } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDnsResolver } from "../src/verify/dnsCache.js";
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
