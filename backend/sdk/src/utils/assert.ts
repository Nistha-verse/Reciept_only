// Fail with a stable SDK code, never with sensitive assertion values.
import { ReceiptsError } from "../errors/ReceiptsError.js";
import type { ErrorCode } from "../errors/codes.js";
export function assert(condition: unknown, code: ErrorCode): asserts condition {
  if (!condition) throw new ReceiptsError(code);
}
