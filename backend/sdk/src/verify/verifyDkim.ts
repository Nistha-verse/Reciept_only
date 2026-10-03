// Real mailauth verification; discard all results containing raw/signed headers.
import { createRequire } from "node:module";
import type { DkimResult, DnsResolver } from "../types/email.js";
import { ReceiptsError } from "../errors/ReceiptsError.js";
const require = createRequire(import.meta.url);
const { dkimVerify } = require("mailauth/lib/dkim/verify.js") as {
  dkimVerify: (
    raw: Buffer,
    options: object,
  ) => Promise<{ results: DkimResult[] }>;
};
export async function verifyDkim(
  bytes: Buffer,
  resolver: DnsResolver,
  now: Date,
): Promise<DkimResult[]> {
  let results: DkimResult[];
  let missing = false,
    unavailable = false;
  const safeResolver: DnsResolver = async (name, type) => {
    try {
      return await resolver(name, type);
    } catch (error: any) {
      if (["ENODATA", "ENOTFOUND"].includes(error?.code)) missing = true;
      else unavailable = true;
      throw Object.assign(new Error("DKIM DNS unavailable"), {
        code: error?.code ?? "EDNS",
      });
    }
  };
  try {
    results = (
      await dkimVerify(bytes, {
        resolver: safeResolver,
        minBitLength: 1024,
        strict: true,
        curTime: now,
      })
    ).results;
  } catch {
    throw new ReceiptsError("TAMPERED");
  }
  const passing = results.filter((r) => r.status.result === "pass");
  if (passing.length)
    return passing.map((r) => ({
      signingDomain: r.signingDomain,
      algo: r.algo,
      modulusLength: r.modulusLength,
      canonBodyLengthLimited: r.canonBodyLengthLimited,
      signingHeaders: { keys: r.signingHeaders?.keys ?? "" },
      status: { result: "pass" },
    }));
  if (unavailable) throw new ReceiptsError("DNS_UNAVAILABLE");
  if (
    missing ||
    results.some((r) =>
      /no key|revoked|not found/i.test(r.status.comment ?? ""),
    )
  )
    throw new ReceiptsError("NOT_SIGNED");
  if (results.some((r) => r.status.result === "policy"))
    throw new ReceiptsError("DKIM_POLICY_FAILED");
  throw new ReceiptsError("TAMPERED");
}
