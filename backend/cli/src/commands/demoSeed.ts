// Post every valid local sample; unsupported/used receipts are counted, never disclosed.
import { sampleFiles } from "./inbox.js";
import { post } from "./post.js";
import { ReceiptsError } from "../../../sdk/src/errors/ReceiptsError.js";
import type { VerifyOptions } from "../../../sdk/src/types/email.js";
export async function demoSeed(options: VerifyOptions = {}) {
  const result = {
    posted: 0,
    skipped: 0,
    outcomes: [] as { code: string; txHash?: string }[],
  };
  const texts = [
    "Food arrived warm and tasted good.",
    "Good portions; delivery took a little longer.",
    "Fresh food and careful packaging.",
  ];
  for (const [i, file] of sampleFiles().entries()) {
    try {
      const r = await post(
        file.path,
        3 + (i % 3),
        texts[i % texts.length],
        false,
        options,
      );
      result.posted++;
      result.outcomes.push({ code: "POSTED", txHash: r.txHash });
    } catch (error) {
      result.skipped++;
      result.outcomes.push({
        code: error instanceof ReceiptsError ? error.code : "TX_FAILED",
      });
    }
  }
  return result;
}
