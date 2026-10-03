// Read public event text, optionally filtered by a known name or bytes32 ID.
import type { Hex } from "viem";
import { getReviews } from "../../../sdk/src/reviews/reader.js";
import { merchantHash } from "../../../sdk/src/utils/hash.js";
export const merchantId = (name?: string) =>
  name
    ? /^0x[0-9a-fA-F]{64}$/.test(name)
      ? (name.toLowerCase() as Hex)
      : merchantHash(name)
    : undefined;
export const read = (merchant?: string) =>
  getReviews({ merchantId: merchantId(merchant), noCache: true });
