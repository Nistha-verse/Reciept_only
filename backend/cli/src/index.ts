#!/usr/bin/env node
// Local-only CLI router; JSON output serializes bigint as decimal strings.
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { doctor } from "./commands/doctor.js";
import { verify } from "./commands/verify.js";
import { post } from "./commands/post.js";
import { read } from "./commands/read.js";
import { merchants } from "./commands/merchants.js";
import { demoSeed } from "./commands/demoSeed.js";
import { inbox } from "./commands/inbox.js";
import { ReceiptsError } from "../../sdk/src/errors/ReceiptsError.js";
import { decodeRevert } from "../../sdk/src/errors/decodeRevert.js";
import type { VerifyOptions } from "../../sdk/src/types/email.js";
export const json = (value: unknown) =>
  JSON.stringify(
    value,
    (_, v) => (typeof v === "bigint" ? v.toString() : v),
    2,
  );
export async function execute(args: string[], injected: VerifyOptions = {}) {
  let parsed;
  try {
    parsed = parseArgs({
      args,
      allowPositionals: true,
      options: {
        json: { type: "boolean" },
        demo: { type: "boolean" },
        offline: { type: "boolean" },
        local: { type: "boolean" },
        merchant: { type: "string" },
      },
    });
  } catch {
    throw new ReceiptsError("INVALID_INPUT");
  }
  const {
    values,
    positionals: [command, ...rest],
  } = parsed;
  if (values.local) process.env.RECEIPTS_LOCAL = "1";
  const opts = { ...injected, offline: values.offline || injected.offline };
  switch (command) {
    case "doctor":
      if (!rest.length) return doctor();
      break;
    case "verify":
      if (rest.length === 1) return verify(rest[0], opts);
      break;
    case "post":
      if (rest.length === 3)
        return post(rest[0], Number(rest[1]), rest[2], values.demo, opts);
      break;
    case "read":
      if (!rest.length) return read(values.merchant);
      break;
    case "merchants":
      if (!rest.length) return merchants();
      break;
    case "inbox":
      if (!rest.length) return inbox();
      break;
    case "demo-seed":
      if (!rest.length) return demoSeed(opts);
      break;
  }
  throw new ReceiptsError("INVALID_INPUT");
}
export async function main(
  args = process.argv.slice(2),
  injected: VerifyOptions = {},
): Promise<number> {
  try {
    console.log(json(await execute(args, injected)));
    return 0;
  } catch (error) {
    const safe = decodeRevert(error);
    console.error(
      args.includes("--json")
        ? json({ error: safe.toJSON() })
        : `${safe.code}: ${safe.message}`,
    );
    return 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().then((code) => {
    process.exitCode = code;
  });
