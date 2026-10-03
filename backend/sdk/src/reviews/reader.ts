// Deployment-bounded log pagination with adaptive RPC ranges, dedupe, and view-backed stats.
import type { Hex } from "viem";
import type {
  ReadOptions,
  Review,
  MerchantSummary,
  ChainOptions,
} from "../types/review.js";
import { getContext } from "../chain/client.js";
import { contract } from "../chain/contract.js";
import { abi } from "../chain/abi.js";
import { retry } from "../utils/retry.js";
import { hashText } from "../utils/hash.js";
import { SMOKE_MERCHANT } from "../config/constants.js";
import { merchantName } from "./merchants.js";
import { cache, cached } from "./cache.js";
import { decodeRevert } from "../errors/decodeRevert.js";
import { explorer } from "../config/chains.js";
export const smokeMerchantId = hashText(SMOKE_MERCHANT);
export async function getReviews(opts: ReadOptions = {}): Promise<Review[]> {
  const ctx = opts.context ?? getContext();
  const key = `${ctx.chainId}:${ctx.address}:${opts.merchantId ?? "all"}:${opts.fromBlock ?? ctx.deploymentBlock}:${!!opts.includeSmoke}`;
  const hit = opts.noCache ? undefined : cached<Review[]>(key);
  if (hit) return hit.map((r) => ({ ...r }));
  try {
    const latest = await retry(() =>
      ctx.publicClient.getBlockNumber({ cacheTime: 0 }),
    );
    let start =
      opts.fromBlock !== undefined && opts.fromBlock > ctx.deploymentBlock
        ? opts.fromBlock
        : ctx.deploymentBlock;
    let span = 2000n;
    const found = new Map<string, Review>();
    while (start <= latest) {
      const end = start + span - 1n < latest ? start + span - 1n : latest;
      let logs;
      try {
        logs = await retry(() =>
          ctx.publicClient.getContractEvents({
            address: ctx.address,
            abi,
            eventName: "ReviewPosted",
            args: opts.merchantId ? { merchantId: opts.merchantId } : undefined,
            fromBlock: start,
            toBlock: end,
            strict: true,
          }),
        );
      } catch (error) {
        if (span === 1n) throw error;
        span = span / 2n || 1n;
        continue;
      }
      for (const event of logs) {
        if (
          event.removed ||
          !event.transactionHash ||
          event.logIndex === null ||
          event.blockNumber === null
        )
          continue;
        const a = event.args;
        if (!opts.includeSmoke && a.merchantId === smokeMerchantId) continue;
        found.set(`${event.transactionHash}:${event.logIndex}`, {
          ...a,
          merchantName: merchantName(a.merchantId),
          txHash: event.transactionHash,
          logIndex: event.logIndex,
          blockNumber: event.blockNumber,
          explorerUrl:
            ctx.chainId === 84532
              ? explorer(event.transactionHash)
              : `local:${event.transactionHash}`,
        });
      }
      start = end + 1n;
    }
    const reviews = [...found.values()].sort((a, b) =>
      a.blockNumber === b.blockNumber
        ? b.logIndex - a.logIndex
        : a.blockNumber > b.blockNumber
          ? -1
          : 1,
    );
    cache(key, reviews);
    return reviews.map((r) => ({ ...r }));
  } catch (error) {
    throw decodeRevert(error);
  }
}
export async function getMerchantSummary(
  opts: ChainOptions = {},
): Promise<MerchantSummary[]> {
  const ctx = opts.context ?? getContext();
  const ids = [
    ...new Set((await getReviews({ context: ctx })).map((r) => r.merchantId)),
  ];
  return Promise.all(
    ids.map(async (merchantId: Hex) => {
      try {
        const [count, sum] = await retry(() =>
          ctx.publicClient.readContract({
            ...contract(ctx),
            functionName: "merchantStats",
            args: [merchantId],
          }),
        );
        return {
          merchantId,
          merchantName: merchantName(merchantId),
          count,
          average: count ? Number(sum) / Number(count) : 0,
        };
      } catch (error) {
        throw decodeRevert(error);
      }
    }),
  );
}
