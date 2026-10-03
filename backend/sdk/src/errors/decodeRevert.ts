// Decode ABI custom errors without exposing transport messages or RPC credentials.
import { decodeErrorResult, type Hex } from "viem";
import { abi } from "../chain/abi.js";
import { ReceiptsError } from "./ReceiptsError.js";
import type { ErrorCode } from "./codes.js";
const mapped: Record<string, ErrorCode> = {
  NullifierAlreadyUsed: "ALREADY_USED",
  InvalidRating: "INVALID_RATING",
  ReviewEmpty: "REVIEW_EMPTY",
  ReviewTooLong: "REVIEW_TOO_LONG",
};
export function decodeRevert(error: unknown): ReceiptsError {
  if (error instanceof ReceiptsError) return error;
  const visit = (value: any, depth = 0): string | undefined => {
    if (!value || depth > 8) return;
    if (typeof value === "string" && /^0x[0-9a-f]+$/i.test(value)) {
      try {
        return decodeErrorResult({ abi, data: value as Hex }).errorName;
      } catch {
        return;
      }
    }
    if (typeof value === "object")
      return (
        value.errorName ??
        visit(value.data, depth + 1) ??
        visit(value.cause, depth + 1)
      );
  };
  return new ReceiptsError(mapped[visit(error) ?? ""] ?? "TX_FAILED");
}
