// Enforce alignment, provider allowlist, header coverage, complete body and key strength.
import { providers } from "../config/providers.js";
import type { DkimResult, ParsedEmail } from "../types/email.js";
import { assert } from "../utils/assert.js";
export function dkimPolicy(
  result: DkimResult,
  email: ParsedEmail,
  fromDomain: string,
) {
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
  const compact = (v: string) => v.replace(/\s+/g, "");
  const signature = email.headers
    .get("dkim-signature")
    ?.map((line) => {
      const tags = new Map<string, string>();
      for (const part of line.split(";")) {
        const index = part.indexOf("=");
        if (index > 0)
          tags.set(part.slice(0, index).trim(), part.slice(index + 1).trim());
      }
      return tags;
    })
    .find(
      (tags) =>
        compact(tags.get("b") ?? "") === compact(result.signature ?? ""),
    );
  assert(signature, "DKIM_POLICY_FAILED");
  const signed = (signature.get("h") ?? "")
    .toLowerCase()
    .split(":")
    .map((s) => s.trim());
  assert(
    ["from", "subject", "date", "message-id"].every((name) =>
      signed.includes(name),
    ),
    "DKIM_POLICY_FAILED",
  );
  assert(
    !signature.has("l") && !result.canonBodyLengthLimited,
    "DKIM_POLICY_FAILED",
  );
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
