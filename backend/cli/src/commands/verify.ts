// Verify a local source file and expose only the approved receipt summary.
import { readFileSync, statSync } from "node:fs";
import { verifyReceipt } from "../../../sdk/src/verify/verifyReceipt.js";
import type { VerifyOptions } from "../../../sdk/src/types/email.js";
import type { VerifiedReceipt } from "../../../sdk/src/types/receipt.js";
import { ReceiptsError } from "../../../sdk/src/errors/ReceiptsError.js";
export const summary = (r: VerifiedReceipt) => ({
  merchantName: r.merchantName,
  orderDate: r.orderDate,
  nullifierPrefix: r.nullifier.slice(0, 14),
  providerId: r.providerId,
});
export function readSource(file: string) {
  try {
    if (statSync(file).size > 1024 * 1024)
      throw new ReceiptsError("BODY_TOO_LARGE");
    return readFileSync(file);
  } catch (error) {
    if (error instanceof ReceiptsError) throw error;
    throw new ReceiptsError("NOT_FOUND");
  }
}
export async function verify(file: string, options: VerifyOptions = {}) {
  return summary(await verifyReceipt(readSource(file), options));
}
