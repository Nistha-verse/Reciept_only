// Stage 1 local-only verification pipeline; returns metadata, never raw email.
import { normalizeRaw } from "../email/normalizeRaw.js";
import { parseEml } from "../email/parseEml.js";
import { extractMetadata } from "../email/extractMetadata.js";
import { checkFreshness } from "../email/checkFreshness.js";
import { extractMerchant } from "../email/extractMerchant.js";
import { verifyDkim } from "./verifyDkim.js";
import { dkimPolicy } from "./dkimPolicy.js";
import { deriveNullifier } from "./deriveNullifier.js";
import { createDnsResolver } from "./dnsCache.js";
import { merchantHash } from "../utils/hash.js";
import { ReceiptsError } from "../errors/ReceiptsError.js";
import type { VerifyOptions } from "../types/email.js";
import type { VerifiedReceipt } from "../types/receipt.js";
export async function verifyReceipt(
  rawEmail: string | Uint8Array,
  opts: VerifyOptions = {},
): Promise<VerifiedReceipt> {
  const email = parseEml(normalizeRaw(rawEmail));
  if (!email.headers.has("dkim-signature"))
    throw new ReceiptsError("NOT_SIGNED");
  const now = opts.now?.() ?? new Date();
  const results = await verifyDkim(
    email.bytes,
    opts.resolver ??
      createDnsResolver({ offline: opts.offline, path: opts.dnsCachePath }),
    now,
  );
  const metadata = extractMetadata(email);
  let failure: ReceiptsError = new ReceiptsError("UNSUPPORTED_SENDER");
  // Inspect passing signatures only; never mix a pass from one signature with
  // the sender/header policy of another. Prefer a provider policy failure.
  for (const result of results) {
    let provider;
    try {
      provider = dkimPolicy(result, email, metadata.fromDomain);
    } catch (error) {
      if (error instanceof ReceiptsError) {
        if (failure.code === "UNSUPPORTED_SENDER") failure = error;
        continue;
      }
      throw error;
    }
    checkFreshness(metadata.date, now);
    const merchantName = extractMerchant(metadata.subject, provider);
    return {
      merchantId: merchantHash(merchantName),
      merchantName,
      nullifier: deriveNullifier(metadata.messageId, result.signingDomain!),
      orderDate: metadata.date.toISOString(),
      providerId: provider.id,
    };
  }
  throw failure;
}
