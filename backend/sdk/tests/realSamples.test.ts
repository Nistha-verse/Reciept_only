// Opt-in local sample verification: never print filenames, metadata values or contents.
import { it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../src/config/env.js";
import { verifyReceipt } from "../src/verify/verifyReceipt.js";
import { ReceiptsError } from "../src/errors/ReceiptsError.js";
const files = readdirSync(join(ROOT, "samples")).filter((f) =>
  f.endsWith(".eml"),
);
it.skipIf(process.env.RUN_REAL_SAMPLES !== "1" || files.length === 0)(
  "classifies local samples without disclosing their contents",
  async () => {
    for (const file of files) {
      try {
        const receipt = await verifyReceipt(
          readFileSync(join(ROOT, "samples", file)),
        );
        expect(receipt.providerId).toBe("zomato");
      } catch (error) {
        expect(error instanceof ReceiptsError).toBe(true);
        console.log("Local sample outcome:", (error as ReceiptsError).code);
      }
    }
  },
);
