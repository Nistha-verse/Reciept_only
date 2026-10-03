// Even the internal verifier result discards raw signed headers and public-key payloads.
import { it, expect } from "vitest";
import { synthetic, NOW } from "./fixtures/synthetic.js";
import { verifyDkim } from "../src/verify/verifyDkim.js";
it("returns only signature-specific policy metadata", async () => {
  const f = await synthetic();
  const result = await verifyDkim(f.raw, f.resolver, NOW);
  expect(result).toHaveLength(1);
  expect(Object.keys(result[0]).sort()).toEqual([
    "algo",
    "canonBodyLengthLimited",
    "modulusLength",
    "signingDomain",
    "signingHeaders",
    "status",
  ]);
  expect(Object.keys(result[0].signingHeaders!)).toEqual(["keys"]);
  expect(JSON.stringify(result)).not.toContain("orders@");
});
