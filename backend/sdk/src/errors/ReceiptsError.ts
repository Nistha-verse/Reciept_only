// Typed safe error with no dependency cause that could leak secrets or email.
import type { ErrorCode } from "./codes.js";
import { messages } from "./messages.js";
export class ReceiptsError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly txHash?: `0x${string}`,
  ) {
    super(messages[code]);
    this.name = "ReceiptsError";
  }
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.txHash ? { txHash: this.txHash } : {}),
    };
  }
}
