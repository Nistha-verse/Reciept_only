// Policy fields come from the actual verified result, never another raw signature.
import { providers } from "../config/providers.js";
import type { DkimResult } from "../types/email.js";
import { assert } from "../utils/assert.js";
export function dkimPolicy(result: DkimResult, fromDomain: string) {
  const domain = result.signingDomain?.toLowerCase() ?? "";
  const belongs = (value: string, root: string) =>
    value === root || value.endsWith(`.${root}`);
  const provider = providers.find((p) =>
    p.domains.some(
      (root) => belongs(domain, root) && belongs(fromDomain, root),
    ),
  );
  assert(
    provider && (belongs(fromDomain, domain) || belongs(domain, fromDomain)),
    "UNSUPPORTED_SENDER",
  );
  // Mapping raw headers only by b= is unsafe: a forged duplicate can reuse b=
  // with a permissive h= while the genuinely passing signature lacks coverage.
  const signed = (result.signingHeaders?.keys ?? "")
    .toLowerCase()
    .split(":")
    .map((s) => s.trim());
  assert(
    ["from", "subject", "date", "message-id"].every((name) =>
      signed.includes(name),
    ),
    "DKIM_POLICY_FAILED",
  );
  assert(result.canonBodyLengthLimited === false, "DKIM_POLICY_FAILED");
  assert(
    result.algo === "rsa-sha256" || result.algo === "ed25519-sha256",
    "DKIM_POLICY_FAILED",
  );
  assert(
    result.algo !== "rsa-sha256" || (result.modulusLength ?? 0) >= 1024,
    "DKIM_POLICY_FAILED",
  );
  return provider;
}
