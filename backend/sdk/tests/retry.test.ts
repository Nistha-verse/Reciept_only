// Transient reads retry; semantic errors do not.
import { it, expect } from "vitest";
import { retry } from "../src/utils/retry.js";
it("retries transient reads with a bounded attempt count", async () => {
  let calls = 0;
  expect(
    await retry(
      async () => {
        if (++calls < 3) throw new Error("network timeout");
        return 7;
      },
      { delayMs: 1 },
    ),
  ).toBe(7);
  calls = 0;
  await expect(
    retry(async () => {
      calls++;
      throw new Error("invalid parameter");
    }),
  ).rejects.toThrow("invalid parameter");
  expect(calls).toBe(1);
});
