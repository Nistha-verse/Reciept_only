// Optional Etherscan V2/Basescan source verification; never print credentials or response bodies.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { ROOT, loadEnv } from "../../sdk/src/config/env.js";
import { getContext } from "../../sdk/src/chain/client.js";
import { execFileSync } from "node:child_process";
const env = loadEnv(),
  ctx = getContext();
const artifactDir = join(ROOT, "backend/contracts/artifacts");
const flatPath = join(artifactDir, "ReceiptsReviews.flattened.sol");
writeFileSync(
  flatPath,
  readFileSync(join(ROOT, "backend/contracts/contracts/ReceiptsReviews.sol")),
);
console.log(
  "Flattened source: backend/contracts/artifacts/ReceiptsReviews.flattened.sol (single-file contract)",
);
if (!env.BASESCAN_API_KEY) {
  console.log("Basescan verification: NOT VERIFIED (BASESCAN_API_KEY absent).");
  console.log(
    "Manual command after adding BASESCAN_API_KEY to .env: npm run verify:source",
  );
  console.log(
    `Manual explorer form: https://sepolia.basescan.org/verifyContract?a=${ctx.address}`,
  );
  console.log(
    "Settings: Solidity 0.8.24+commit.e11b9ed9, optimizer 200, EVM paris, no constructor arguments, MIT.",
  );
} else {
  try {
    const debugPath = join(
      artifactDir,
      "contracts/ReceiptsReviews.sol/ReceiptsReviews.dbg.json",
    );
    const debug = JSON.parse(readFileSync(debugPath, "utf8"));
    const build = JSON.parse(
      readFileSync(resolve(dirname(debugPath), debug.buildInfo), "utf8"),
    );
    const request = async (fields: Record<string, string>) => {
      const body = new URLSearchParams({
        chainid: "84532",
        module: "contract",
        apikey: env.BASESCAN_API_KEY,
        ...fields,
      });
      try {
        const result = await fetch(
          "https://api.etherscan.io/v2/api?chainid=84532",
          { method: "POST", body, signal: AbortSignal.timeout(10000) },
        );
        return (await result.json()) as { status: string; result: string };
      } catch (error: any) {
        const category = String(
          error?.cause?.code ?? error?.name ?? "TRANSPORT",
        );
        console.log(
          "Verification fetch failed:",
          /^[A-Za-z0-9_]+$/.test(category) ? category : "TRANSPORT",
          "Trying curl with credentials on stdin only.",
        );
        const output = execFileSync(
          "curl",
          [
            "--silent",
            "--show-error",
            "--fail-with-body",
            "--max-time",
            "20",
            "https://api.etherscan.io/v2/api?chainid=84532",
            "--data-binary",
            "@-",
          ],
          {
            input: body.toString(),
            encoding: "utf8",
            stdio: ["pipe", "pipe", "pipe"],
            maxBuffer: 1024 * 1024,
          },
        );
        return JSON.parse(output) as { status: string; result: string };
      }
    };
    let verified = false;
    for (let attempt = 0; attempt < 3 && !verified; attempt++) {
      const result = await request({
        action: "verifysourcecode",
        contractaddress: ctx.address,
        sourceCode: JSON.stringify(build.input),
        codeformat: "solidity-standard-json-input",
        contractname: "contracts/ReceiptsReviews.sol:ReceiptsReviews",
        compilerversion: "v0.8.24+commit.e11b9ed9",
        optimizationUsed: "1",
        runs: "200",
        constructorArguements: "",
        licenseType: "3",
      });
      if (result.status !== "1")
        console.log(
          "Verification API outcome:",
          /invalid.*key/i.test(result.result)
            ? "INVALID_API_KEY"
            : /free.*tier|not supported/i.test(result.result)
              ? "CHAIN_OR_PLAN_NOT_SUPPORTED"
              : /already verified/i.test(result.result)
                ? "ALREADY_VERIFIED"
                : "REJECTED_OR_PENDING",
        );
      if (/already verified/i.test(result.result)) verified = true;
      else if (result.status === "1") {
        for (let poll = 0; poll < 6; poll++) {
          await new Promise((r) => setTimeout(r, 5000));
          const status = await request({
            action: "checkverifystatus",
            guid: result.result,
          });
          if (status.status === "1") {
            verified = true;
            break;
          }
          if (!/pending|queue/i.test(status.result)) break;
        }
      }
      if (!verified) await new Promise((r) => setTimeout(r, 5000));
    }
    console.log(
      verified
        ? "Basescan verification: VERIFIED"
        : "Basescan verification: NOT VERIFIED after retries; use the manual form or rerun npm run verify:source.",
    );
  } catch {
    console.log(
      "Basescan verification: NOT VERIFIED; API request failed (credentials and server response suppressed).",
    );
  }
}
