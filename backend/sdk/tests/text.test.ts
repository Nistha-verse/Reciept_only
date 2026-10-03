// SDK counts Unicode codepoints rather than UTF-16 code units or graphemes.
import { it, expect } from "vitest";
import { validateReview, normalizeMerchant } from "../src/utils/text.js";
it("validates Unicode and rating bounds", () => {
  expect(() => validateReview(5, "🍜".repeat(280))).not.toThrow();
  expect(() => validateReview(5, "🍜".repeat(281))).toThrowError(
    expect.objectContaining({ code: "REVIEW_TOO_LONG" }),
  );
  expect(() => validateReview(1.5, "x")).toThrowError(
    expect.objectContaining({ code: "INVALID_RATING" }),
  );
  expect(() => validateReview(1, "  ")).toThrowError(
    expect.objectContaining({ code: "REVIEW_EMPTY" }),
  );
  expect(normalizeMerchant("  Cafe   NAME  ")).toBe("cafe name");
});
