// Sensitive field names and arbitrary strings are never emitted by the logger.
import { it, expect } from "vitest";
import { redact } from "../src/utils/logger.js";
it("redacts emails, credentials, authorization and unknown objects", () => {
  const values = redact({
    raw: "private",
    email: "a@example.invalid",
    key: "private",
    token: "private",
    Authorization: "Bearer abc",
    arbitrary: { secret: "hidden" },
    code: "TAMPERED",
  });
  expect(Object.values(values).filter((v) => v === "[REDACTED]").length).toBe(
    6,
  );
  expect(values.code).toBe("TAMPERED");
});
