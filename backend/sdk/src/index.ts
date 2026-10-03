// Public exports only. This Stage 1 SDK is Node-local, not a browser bundle.
export { verifyReceipt } from "./verify/verifyReceipt.js";
export { postReview } from "./chain/postReview.js";
export { getReviews, getMerchantSummary } from "./reviews/reader.js";
export { ReceiptsError } from "./errors/ReceiptsError.js";
export { ERROR_CODES } from "./errors/codes.js";
export type { ErrorCode } from "./errors/codes.js";
export type { VerifyOptions, DnsResolver } from "./types/email.js";
export type { VerifiedReceipt } from "./types/receipt.js";
export type {
  ChainContext,
  ChainOptions,
  PostOptions,
  ReadOptions,
  PostedReview,
  Review,
  MerchantSummary,
} from "./types/review.js";
