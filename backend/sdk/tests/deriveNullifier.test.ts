// Message ID casing is intentionally collapsed while different IDs stay distinct.
import { it, expect } from "vitest";
import { deriveNullifier } from "../src/verify/deriveNullifier.js";
it("is deterministic and case insensitive", () => {
  expect(deriveNullifier("<ORDER@ZOMATO.COM>", "ZOMATO.COM")).toBe(
    deriveNullifier("<order@zomato.com>", "zomato.com"),
  );
  expect(deriveNullifier("<other@zomato.com>", "zomato.com")).not.toBe(
    deriveNullifier("<order@zomato.com>", "zomato.com"),
  );
});
