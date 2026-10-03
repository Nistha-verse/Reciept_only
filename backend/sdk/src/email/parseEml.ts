// Parse a separate header view; preserve the exact bytes passed to DKIM.
import type { ParsedEmail } from "../types/email.js";
import { assert } from "../utils/assert.js";
export function parseEml(bytes: Buffer): ParsedEmail {
  const separator = bytes.indexOf("\r\n\r\n");
  assert(separator > 0 && separator < 65536, "EMAIL_PARSE_FAILED");
  const header = bytes.subarray(0, separator).toString("latin1");
  assert(!/(?<!\r)\n|\r(?!\n)|\x00/.test(header), "EMAIL_PARSE_FAILED");
  const headers = new Map<string, string[]>();
  for (const line of header.replace(/\r\n[ \t]+/g, " ").split("\r\n")) {
    const match = /^([!-9;-~]+):[ \t]*(.*)$/.exec(line);
    assert(match, "EMAIL_PARSE_FAILED");
    const name = match[1].toLowerCase();
    headers.set(name, [...(headers.get(name) ?? []), match[2].trim()]);
  }
  assert(headers.get("from")?.length === 1, "EMAIL_PARSE_FAILED");
  for (const name of ["subject", "date", "message-id"])
    assert((headers.get(name)?.length ?? 0) <= 1, "EMAIL_PARSE_FAILED");
  assert(
    (headers.get("dkim-signature")?.length ?? 0) <= 8,
    "EMAIL_PARSE_FAILED",
  );
  return { bytes, headers };
}
