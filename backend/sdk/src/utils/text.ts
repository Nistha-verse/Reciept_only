// Unicode-aware text validation and stable merchant normalization.
import { ReceiptsError } from "../errors/ReceiptsError.js";
export const normalizeMerchant = (value: string) =>
  value.trim().replace(/\s+/gu, " ").toLowerCase();
export function validateReview(rating: number, text: string) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    throw new ReceiptsError("INVALID_RATING");
  if (!text.trim()) throw new ReceiptsError("REVIEW_EMPTY");
  if ([...text].length > 280 || Buffer.byteLength(text) > 1120)
    throw new ReceiptsError("REVIEW_TOO_LONG");
}
