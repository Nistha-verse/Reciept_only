// Reject remote bridge destinations and unsupported chains before accepting any email input.
import { z } from "zod";
import { deployment } from "virtual:receipts-sdk-contract";
const bridgeUrl = z.url().refine((value) => {
  const url = new URL(value);
  return (
    url.protocol === "http:" &&
    ["127.0.0.1", "localhost"].includes(url.hostname) &&
    !url.username &&
    !url.password &&
    url.pathname === "/" &&
    !url.search &&
    !url.hash
  );
}, "Receipt processing requires an HTTP localhost bridge.");
const schema = z.object({
  bridge: bridgeUrl.transform(value => new URL(value).origin),
  chainId: z.coerce
    .number()
    .refine((value) => value === 84532, "Only Base Sepolia is supported."),
  address: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
});
export const env = schema.parse({
  bridge: import.meta.env.VITE_BRIDGE_URL || "http://127.0.0.1:3001",
  chainId: import.meta.env.VITE_CHAIN_ID || 84532,
  address: import.meta.env.VITE_CONTRACT_ADDRESS || deployment.address,
});
export const contractUrl = `https://sepolia.basescan.org/address/${env.address}`;
export const faucetUrl = "https://www.alchemy.com/faucets/base-sepolia";
export const isTestMode =
  import.meta.env.DEV && import.meta.env.VITE_TEST_MOCKS === "true";
