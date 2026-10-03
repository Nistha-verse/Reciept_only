// Real local-node exercise of simulate/send/receipt/event/read and salted demo reuse.
import { it, expect } from "vitest";
import { localChain } from "./fixtures/localChain.js";
import { synthetic, NOW } from "./fixtures/synthetic.js";
import {
  verifyReceipt,
  postReview,
  getReviews,
  getMerchantSummary,
} from "../src/index.js";
it("deploys, posts, reads, rejects replay and explicitly salts demo reuse", async () => {
  const { context, stop } = await localChain();
  try {
    const f = await synthetic();
    const receipt = await verifyReceipt(f.raw, {
      resolver: f.resolver,
      now: () => NOW,
    });
    const posted = await postReview(receipt, 4, "Synthetic local review", {
      context,
    });
    expect(posted.reviewId).toBe(1n);
    const reviews = await getReviews({ context });
    expect(reviews[0].text).toBe("Synthetic local review");
    await expect(
      postReview(receipt, 4, "Reuse", { context }),
    ).rejects.toMatchObject({ code: "ALREADY_USED" });
    await postReview(receipt, 5, "Explicit demo", {
      context,
      demoSalt: "synthetic-demo",
    });
    expect((await getReviews({ context })).length).toBe(2);
    expect((await getMerchantSummary({ context }))[0]).toMatchObject({
      count: 2n,
      average: 4.5,
    });
  } finally {
    stop();
  }
}, 60000);
