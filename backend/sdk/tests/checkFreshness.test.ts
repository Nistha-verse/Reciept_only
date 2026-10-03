// Exact freshness boundaries with a fixed clock.
import { it, expect } from "vitest";
import { checkFreshness } from "../src/email/checkFreshness.js";
it("accepts exactly 90 days and rejects older or future dates", () => {
  const now = new Date("2026-10-03T00:00:00Z");
  expect(() =>
    checkFreshness(new Date(+now - 90 * 86400000), now),
  ).not.toThrow();
  expect(() =>
    checkFreshness(new Date(+now - 90 * 86400000 - 1), now),
  ).toThrowError(expect.objectContaining({ code: "TOO_OLD" }));
  expect(() => checkFreshness(new Date(+now + 1), now)).toThrowError(
    expect.objectContaining({ code: "EMAIL_IN_FUTURE" }),
  );
});
