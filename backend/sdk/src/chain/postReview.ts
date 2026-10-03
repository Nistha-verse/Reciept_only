// Stage 1 send pipeline; never retry a send whose broadcast state is uncertain.
import { decodeEventLog, encodePacked, keccak256, type Hex } from "viem";
import type { VerifiedReceipt } from "../types/receipt.js";
import type { PostOptions, PostedReview } from "../types/review.js";
import { getContext } from "./client.js";
import { contract } from "./contract.js";
import { abi } from "./abi.js";
import { simulate } from "./simulate.js";
import { retry } from "../utils/retry.js";
import { validateReview } from "../utils/text.js";
import { log } from "../utils/logger.js";
import { ReceiptsError } from "../errors/ReceiptsError.js";
import { decodeRevert } from "../errors/decodeRevert.js";
import { invalidate } from "../reviews/cache.js";
import { rememberMerchant } from "../reviews/merchants.js";
import { explorer } from "../config/chains.js";
export async function postReview(
  receipt: VerifiedReceipt,
  rating: number,
  text: string,
  opts: PostOptions = {},
): Promise<PostedReview> {
  validateReview(rating, text);
  const context = opts.context ?? getContext();
  let nullifier = receipt.nullifier;
  if (opts.demoSalt !== undefined) {
    nullifier = keccak256(
      encodePacked(["bytes32", "string"], [nullifier, opts.demoSalt]),
    );
    log("demo");
  }
  let hash: Hex | undefined;
  try {
    if (
      (await retry(() => context.publicClient.getChainId())) !== context.chainId
    )
      throw new ReceiptsError("ENV_INVALID");
    if (
      await retry(() =>
        context.publicClient.readContract({
          ...contract(context),
          functionName: "isNullifierUsed",
          args: [nullifier],
        }),
      )
    )
      throw new ReceiptsError("ALREADY_USED");
    const request = await simulate(
      context,
      nullifier,
      receipt.merchantId,
      rating,
      text,
    );
    // Transport retryCount is zero. This call must never be wrapped in retry().
    hash = await context.walletClient!.writeContract(request);
    let mined;
    try {
      mined = await context.publicClient.waitForTransactionReceipt({
        hash,
        timeout: opts.timeoutMs ?? 120000,
        confirmations: 1,
      });
    } catch {
      throw new ReceiptsError("TX_PENDING", hash);
    }
    if (mined.status !== "success") throw new ReceiptsError("TX_FAILED", hash);
    for (const event of mined.logs) {
      if (event.address.toLowerCase() !== context.address.toLowerCase())
        continue;
      try {
        const decoded = decodeEventLog({
          abi,
          data: event.data,
          topics: event.topics,
          eventName: "ReviewPosted",
        });
        if (
          decoded.args.nullifier !== nullifier ||
          decoded.args.merchantId !== receipt.merchantId
        )
          continue;
        rememberMerchant(receipt.merchantId, receipt.merchantName);
        invalidate();
        return {
          reviewId: decoded.args.reviewId,
          txHash: hash,
          blockNumber: mined.blockNumber,
          explorerUrl:
            context.chainId === 84532 ? explorer(hash) : `local:${hash}`,
        };
      } catch {
        /* Ignore unrelated logs, then fail if the expected event is missing. */
      }
    }
    throw new ReceiptsError("TX_FAILED", hash);
  } catch (error) {
    throw decodeRevert(error);
  }
}
