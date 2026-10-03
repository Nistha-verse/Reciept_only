// Byte preservation and the sole permitted pasted-source transformation.
import { it, expect } from "vitest";
import { normalizeRaw } from "../src/email/normalizeRaw.js";
it("preserves file bytes and normalizes bare LF only for strings", () => {
  const bytes = Buffer.from([0xff, 0x0a, 0x0d, 0x0a]);
  expect(normalizeRaw(bytes)).toEqual(bytes);
  expect(normalizeRaw("a\nb\r\nc\rd").toString()).toBe("a\r\nb\r\nc\rd");
});
