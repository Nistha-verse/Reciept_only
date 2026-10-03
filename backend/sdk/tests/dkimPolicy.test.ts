// Regression: invalid duplicate signatures must not supply a passing signature's policy.
import { it, expect } from "vitest";
import { synthetic, NOW } from "./fixtures/synthetic.js";
import { verifyReceipt } from "../src/verify/verifyReceipt.js";
it("rejects a forged duplicate b= header that claims missing signed coverage", async () => {
  const f = await synthetic({ headers: "from:subject:date" });
  const raw = f.raw.toString();
  const signature = raw.slice(0, raw.indexOf("\r\nFrom:"));
  const forged = signature.replace(
    /h=([^;]+)/,
    (_whole, names: string) => `h=${names}:message-id`,
  );
  await expect(
    verifyReceipt(`${forged}\r\n${raw}`, {
      resolver: f.resolver,
      now: () => NOW,
    }),
  ).rejects.toMatchObject({ code: "DKIM_POLICY_FAILED" });
});
