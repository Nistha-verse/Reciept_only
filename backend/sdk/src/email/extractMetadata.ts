// Extract unique signed metadata using a deliberately conservative address grammar.
import type { ParsedEmail } from "../types/email.js";
import { assert } from "../utils/assert.js";
export function extractMetadata(email: ParsedEmail) {
  const from = email.headers.get("from")?.[0] ?? "";
  const mailbox = /^(?:[^<>@,]*<([^<>]+)>|([^<>\s]+))$/.exec(from);
  const address = mailbox?.[1] ?? mailbox?.[2] ?? "";
  const match = /^[^@\s<>]+@([a-zA-Z0-9.-]+)$/.exec(address);
  assert(match && !address.includes(","), "EMAIL_PARSE_FAILED");
  const messageId = email.headers.get("message-id")?.[0] ?? "";
  assert(/^<[^<>\s@]+@[^<>\s@]+>$/.test(messageId), "EMAIL_PARSE_FAILED");
  const date = email.headers.get("date")?.[0];
  assert(date && Number.isFinite(Date.parse(date)), "EMAIL_PARSE_FAILED");
  assert(email.headers.has("subject"), "EMAIL_PARSE_FAILED");
  return {
    fromDomain: match[1].toLowerCase(),
    messageId,
    date: new Date(date),
    subject: email.headers.get("subject")![0],
  };
}
