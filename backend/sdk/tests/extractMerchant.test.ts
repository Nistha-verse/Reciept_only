// Until a real provider template is reviewed, customer text cannot name a merchant.
import { it, expect } from "vitest";
import { extractMerchant } from "../src/email/extractMerchant.js";
import { providers } from "../src/config/providers.js";
it("uses fallback even when a subject resembles an order template", () => {
  expect(extractMerchant("Your order from Attacker Notes", providers[0])).toBe(
    "Zomato order",
  );
});
