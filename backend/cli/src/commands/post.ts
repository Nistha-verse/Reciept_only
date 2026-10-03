// Verify locally before posting; demo reuse is explicit and always visibly logged.
import { randomUUID } from "node:crypto";
import { verifyReceipt } from "../../../sdk/src/verify/verifyReceipt.js";
import { postReview } from "../../../sdk/src/chain/postReview.js";
import type { VerifyOptions } from "../../../sdk/src/types/email.js";
import { readSource, summary } from "./verify.js";
export async function post(
  file: string,
  rating: number,
  text: string,
  demo = false,
  options: VerifyOptions = {},
) {
  const receipt = await verifyReceipt(readSource(file), options);
  return {
    ...summary(receipt),
    ...(await postReview(receipt, rating, text, {
      demoSalt: demo ? randomUUID() : undefined,
    })),
  };
}
