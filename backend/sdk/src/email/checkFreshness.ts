// Check the signed Date against an injectable clock, without future tolerance.
import { MAX_AGE_MS } from "../config/constants.js";
import { ReceiptsError } from "../errors/ReceiptsError.js";
export function checkFreshness(date: Date, now: Date) {
  if (!Number.isFinite(date.getTime()) || !Number.isFinite(now.getTime()))
    throw new ReceiptsError("EMAIL_PARSE_FAILED");
  if (date > now) throw new ReceiptsError("EMAIL_IN_FUTURE");
  if (now.getTime() - date.getTime() > MAX_AGE_MS)
    throw new ReceiptsError("TOO_OLD");
}
