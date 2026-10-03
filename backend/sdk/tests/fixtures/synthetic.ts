// Synthetic messages and ephemeral RSA keys only. Never persist the private key.
import { generateKeyPairSync } from "node:crypto";
import { createRequire } from "node:module";
import type { DnsResolver } from "../../src/types/email.js";
const require = createRequire(import.meta.url);
const { dkimSign } = require("mailauth/lib/dkim/sign.js");
export const NOW = new Date("2026-10-03T12:00:00Z");
const pair = generateKeyPairSync("rsa", { modulusLength: 2048 });
export async function synthetic(
  options: {
    date?: Date;
    domain?: string;
    fromDomain?: string;
    messageId?: string;
    headers?: string;
    maxBodyLength?: number;
    weak?: boolean;
  } = {},
) {
  const domain = options.domain ?? "zomato.com";
  const keys = options.weak
    ? generateKeyPairSync("rsa", { modulusLength: 512 })
    : pair;
  const unsigned = [
    `From: Zomato <orders@${options.fromDomain ?? domain}>`,
    "To: Synthetic <person@example.invalid>",
    "Subject: Synthetic order confirmation",
    `Date: ${(options.date ?? new Date(NOW.getTime() - 3600000)).toUTCString()}`,
    `Message-ID: ${options.messageId ?? "<synthetic-1@zomato.com>"}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "",
    "Synthetic order receipt.",
    "Customer note: Never trust this as a restaurant.",
    "",
  ].join("\r\n");
  const signed = await dkimSign(Buffer.from(unsigned), {
    signTime: NOW,
    headerList:
      options.headers ??
      "from:subject:date:message-id:mime-version:content-type",
    signatureData: [
      {
        signingDomain: domain,
        selector: "synthetic",
        privateKey: keys.privateKey.export({ type: "pkcs8", format: "pem" }),
        maxBodyLength: options.maxBodyLength,
      },
    ],
  });
  if (!signed.signatures) throw new Error("Synthetic signing failed");
  const record = `v=DKIM1; k=rsa; p=${keys.publicKey.export({ type: "spki", format: "der" }).toString("base64")}`;
  const resolver: DnsResolver = async (name, type) => {
    if (name !== `synthetic._domainkey.${domain}` || type !== "TXT")
      throw Object.assign(new Error("missing synthetic key"), {
        code: "ENOTFOUND",
      });
    return [[record]];
  };
  return { raw: Buffer.from(signed.signatures + unsigned), unsigned, resolver };
}
