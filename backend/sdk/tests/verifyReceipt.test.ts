// Adversarial full-pipeline tests use generated signatures and injected DNS only.
import { describe, it, expect } from "vitest";
import { verifyReceipt } from "../src/verify/verifyReceipt.js";
import { synthetic, NOW } from "./fixtures/synthetic.js";
describe("verifyReceipt", () => {
  it("accepts a valid signed synthetic receipt and exposes only metadata", async () => {
    const f = await synthetic();
    const r = await verifyReceipt(f.raw, {
      resolver: f.resolver,
      now: () => NOW,
    });
    expect(Object.keys(r).sort()).toEqual([
      "merchantId",
      "merchantName",
      "nullifier",
      "orderDate",
      "providerId",
    ]);
    expect(r.merchantName).toBe("Zomato order");
    expect(r.providerId).toBe("zomato");
  });
  for (const [name, from, to] of [
    ["body", "Synthetic order receipt.", "Synthetic order receipX."],
    ["subject", "Subject: Synthetic", "Subject: Synthetix"],
  ])
    it(`rejects changed ${name}`, async () => {
      const f = await synthetic();
      await expect(
        verifyReceipt(f.raw.toString().replace(from, to), {
          resolver: f.resolver,
          now: () => NOW,
        }),
      ).rejects.toMatchObject({ code: "TAMPERED" });
    });
  it("rejects unsigned source", async () => {
    const f = await synthetic();
    await expect(verifyReceipt(f.unsigned)).rejects.toMatchObject({
      code: "NOT_SIGNED",
    });
  });
  for (const [name, options, code] of [
    ["unsupported sender", { domain: "example.invalid" }, "UNSUPPORTED_SENDER"],
    [
      "unaligned sender",
      { fromDomain: "example.invalid" },
      "UNSUPPORTED_SENDER",
    ],
    [
      "unsigned message-id",
      { headers: "from:subject:date" },
      "DKIM_POLICY_FAILED",
    ],
    ["body length tag", { maxBodyLength: 4 }, "DKIM_POLICY_FAILED"],
    [
      "old receipt",
      { date: new Date(NOW.getTime() - 91 * 86400000) },
      "TOO_OLD",
    ],
    [
      "future receipt",
      { date: new Date(NOW.getTime() + 1000) },
      "EMAIL_IN_FUTURE",
    ],
    ["weak RSA key", { weak: true }, "DKIM_POLICY_FAILED"],
  ] as const)
    it(`rejects ${name}`, async () => {
      const f = await synthetic(options);
      await expect(
        verifyReceipt(f.raw, { resolver: f.resolver, now: () => NOW }),
      ).rejects.toMatchObject({ code });
    });
  it("rejects duplicate From and duplicate signed metadata", async () => {
    const f = await synthetic();
    for (const header of [
      "From: orders@zomato.com",
      "Subject: injected",
      "Date: today",
      "Message-ID: <injected@zomato.com>",
    ]) {
      await expect(
        verifyReceipt(`${header}\r\n${f.raw.toString()}`, {
          resolver: f.resolver,
        }),
      ).rejects.toMatchObject({ code: "EMAIL_PARSE_FAILED" });
    }
  });
  it("normalizes pasted LF with the same result; original buffer stays unchanged", async () => {
    const f = await synthetic(),
      original = Buffer.from(f.raw);
    const opts = { resolver: f.resolver, now: () => NOW };
    expect(
      await verifyReceipt(f.raw.toString().replace(/\r\n/g, "\n"), opts),
    ).toEqual(await verifyReceipt(f.raw, opts));
    expect(f.raw.equals(original)).toBe(true);
  });
  it("missing DNS key has a stable non-sensitive error", async () => {
    const f = await synthetic();
    await expect(
      verifyReceipt(f.raw, {
        resolver: async () => {
          throw Object.assign(new Error("sensitive dependency message"), {
            code: "ENOTFOUND",
          });
        },
      }),
    ).rejects.toMatchObject({ code: "NOT_SIGNED" });
  });
});
