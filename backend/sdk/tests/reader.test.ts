// RPC range rejection shrinks requests; duplicates and smoke entries are filtered.
import { it, expect } from "vitest";
import { getReviews, smokeMerchantId } from "../src/reviews/reader.js";
import { hashText } from "../src/utils/hash.js";
import type { ChainContext } from "../src/types/review.js";
it("shrinks ranges, deduplicates and sorts newest first", async () => {
  let rejected = 0;
  const ctx = {
    chainId: 31337,
    address: "0x0000000000000000000000000000000000000001",
    deploymentBlock: 5n,
    publicClient: {
      getBlockNumber: async () => 10n,
      getContractEvents: async ({ fromBlock, toBlock }: any) => {
        if (toBlock - fromBlock > 1n) {
          rejected++;
          throw new Error("range too wide");
        }
        const logs = [5n, 9n, 10n]
          .filter((b) => b >= fromBlock && b <= toBlock)
          .map((b) => ({
            args: {
              reviewId: b,
              merchantId: b === 10n ? smokeMerchantId : hashText("merchant"),
              nullifier: hashText(`n${b}`),
              rating: 5,
              text: "x",
              postedAt: 1n,
            },
            blockNumber: b,
            transactionHash: hashText(`t${b}`),
            logIndex: 0,
            removed: false,
          }));
        return [...logs, ...logs];
      },
    },
  } as unknown as ChainContext;
  const rows = await getReviews({ context: ctx, noCache: true });
  expect(rejected).toBeGreaterThan(0);
  expect(rows.map((r) => r.blockNumber)).toEqual([9n, 5n]);
});
