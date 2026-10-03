// Pasted text may lose RFC822 CRLF. Replace bare LF only; file bytes are untouched.
import { MAX_EMAIL_BYTES } from "../config/constants.js";
import { ReceiptsError } from "../errors/ReceiptsError.js";
export function normalizeRaw(raw: string | Uint8Array): Buffer {
  const bytes =
    typeof raw === "string"
      ? Buffer.from(raw.replace(/(?<!\r)\n/g, "\r\n"), "utf8")
      : Buffer.from(raw);
  if (!bytes.length || bytes.length > MAX_EMAIL_BYTES)
    throw new ReceiptsError("EMAIL_PARSE_FAILED");
  return bytes;
}
