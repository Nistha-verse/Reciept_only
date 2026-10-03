// Verify deployed runtime, ABI selectors, empty initial state and unknown-merchant stats.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { toFunctionSelector } from "viem";
import { ROOT } from "../../sdk/src/config/env.js";
import { getContext } from "../../sdk/src/chain/client.js";
import { contract } from "../../sdk/src/chain/contract.js";
import { abi } from "../../sdk/src/chain/abi.js";
import { hashText } from "../../sdk/src/utils/hash.js";
export async function sanity(requireEmpty = true) {
  const ctx = getContext();
  const artifact = JSON.parse(
    readFileSync(
      join(
        ROOT,
        "backend/contracts/artifacts/contracts/ReceiptsReviews.sol/ReceiptsReviews.json",
      ),
      "utf8",
    ),
  );
  const runtime = await ctx.publicClient.getCode({ address: ctx.address });
  if (!runtime || runtime === "0x" || runtime !== artifact.deployedBytecode)
    throw new Error("Runtime bytecode mismatch");
  if (JSON.stringify(abi) !== JSON.stringify(artifact.abi))
    throw new Error("SDK ABI differs from artifact");
  const selectors = abi
    .filter((item) => item.type === "function")
    .map(toFunctionSelector);
  const reviewCount = await ctx.publicClient.readContract({
    ...contract(ctx),
    functionName: "reviewCount",
  });
  if (requireEmpty && reviewCount !== 0n)
    throw new Error("Expected empty deployment");
  const stats = await ctx.publicClient.readContract({
    ...contract(ctx),
    functionName: "merchantStats",
    args: [hashText(randomUUID())],
  });
  if (stats[0] || stats[1]) throw new Error("Unknown merchant was not empty");
  console.log(
    JSON.stringify({
      sanity: "passed",
      address: ctx.address,
      runtimeMatchesArtifact: true,
      abiMatches: true,
      selectors,
      reviewCount: reviewCount.toString(),
      unknownMerchantStats: [0, 0],
    }),
  );
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  sanity(!process.argv.includes("--after-smoke")).catch(() => {
    console.error(
      "SANITY_FAILED: runtime, ABI, chain access or expected state did not match.",
    );
    process.exitCode = 1;
  });
