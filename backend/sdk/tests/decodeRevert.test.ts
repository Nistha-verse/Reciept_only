// Every contract custom error selector maps to the stable SDK error table.
import { it, expect } from "vitest";
import { encodeErrorResult } from "viem";
import { abi } from "../src/chain/abi.js";
import { decodeRevert } from "../src/errors/decodeRevert.js";
for (const [errorName, code] of [
  ["NullifierAlreadyUsed", "ALREADY_USED"],
  ["InvalidRating", "INVALID_RATING"],
  ["ReviewEmpty", "REVIEW_EMPTY"],
  ["ReviewTooLong", "REVIEW_TOO_LONG"],
  ["InvalidMerchant", "TX_FAILED"],
  ["InvalidNullifier", "TX_FAILED"],
  ["ReviewNotFound", "TX_FAILED"],
] as const)
  it(`decodes ${errorName}`, () => {
    expect(
      decodeRevert({ cause: { data: encodeErrorResult({ abi, errorName }) } })
        .code,
    ).toBe(code);
  });
it("redacts unknown errors", () => {
  expect(
    decodeRevert(new Error("sensitive RPC credential")).message,
  ).not.toContain("credential");
});
