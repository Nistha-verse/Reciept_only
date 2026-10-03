// Secrets are read only from the repository .env, never from process env or logs.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "dotenv";
import { privateKeyToAccount } from "viem/accounts";
import { ReceiptsError } from "../errors/ReceiptsError.js";
function root() {
  for (const start of [
    process.cwd(),
    dirname(fileURLToPath(import.meta.url)),
  ]) {
    let path = resolve(start);
    while (dirname(path) !== path) {
      const manifest = join(path, "package.json");
      if (
        existsSync(manifest) &&
        JSON.parse(readFileSync(manifest, "utf8")).name === "receipts-only"
      )
        return path;
      path = dirname(path);
    }
  }
  throw new ReceiptsError("ENV_INVALID");
}
export const ROOT = root();
export function loadEnv(): Record<string, string> & {
  privateKey: `0x${string}`;
  rpcUrl: string;
} {
  try {
    const values = parse(readFileSync(join(ROOT, ".env")));
    const raw = values.DEPLOYER_PRIVATE_KEY?.trim() ?? "";
    const privateKey = (
      /^[a-fA-F0-9]{64}$/.test(raw) ? `0x${raw}` : raw
    ) as `0x${string}`;
    if (!/^0x[\da-fA-F]{64}$/.test(privateKey)) throw new Error();
    privateKeyToAccount(privateKey);
    const url = new URL(values.BASE_SEPOLIA_RPC_URL);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    return { ...values, privateKey, rpcUrl: url.toString() };
  } catch {
    throw new ReceiptsError("ENV_INVALID");
  }
}
