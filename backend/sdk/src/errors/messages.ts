// Safe fixed messages; never interpolate email, key, RPC, or dependency errors.
import type { ErrorCode } from "./codes.js";
export const messages: Record<ErrorCode, string> = {
  EMAIL_PARSE_FAILED: "The email source is malformed or has ambiguous headers.",
  NOT_SIGNED: "No usable DKIM signature or published DKIM key was found.",
  TAMPERED:
    "The receipt signature or body hash does not match. Use the original email source.",
  UNSUPPORTED_SENDER:
    "Only aligned Zomato signing and sender domains are supported.",
  DKIM_POLICY_FAILED:
    "The signature does not meet the signed-header, full-body, or strong-key policy.",
  TOO_OLD: "The receipt is more than 90 days old.",
  EMAIL_IN_FUTURE: "The receipt date is in the future.",
  DNS_UNAVAILABLE:
    "The DKIM key lookup failed or is not available in the offline cache.",
  ALREADY_USED: "This receipt has already been used.",
  INVALID_RATING: "Choose a whole-number rating from 1 to 5.",
  REVIEW_EMPTY: "Write a review before posting.",
  REVIEW_TOO_LONG: "Keep the review within 280 Unicode code points.",
  TX_FAILED: "The chain request failed. Check the network and wallet balance.",
  TX_PENDING:
    "Transaction confirmation is unknown. Check the transaction before trying again.",
  ENV_INVALID:
    "Local configuration is missing or invalid. Check .env without sharing its contents.",
  INVALID_INPUT: "The request contains invalid fields.",
  NOT_FOUND: "The requested local item was not found.",
  FORBIDDEN: "This development bridge only accepts approved local requests.",
  RATE_LIMITED: "Too many posts. Wait one minute and try again.",
  BODY_TOO_LARGE: "The request exceeds the 1 MB limit.",
};
