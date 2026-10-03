// A send failure is never automatically retried; confirmation uncertainty keeps its hash.
import { it, expect, vi } from "vitest";
import { postReview } from "../src/chain/postReview.js";
import { hashText } from "../src/utils/hash.js";
import type { ChainContext } from "../src/types/review.js";
const receipt = {
  nullifier: hashText("receipt"),
  merchantId: hashText("zomato order"),
  merchantName: "Zomato order",
  orderDate: "2026-10-03",
  providerId: "zomato",
};
it("never retries a possibly broadcast send", async () => {
  const send = vi.fn().mockRejectedValue(new Error("network timeout"));
  const context = {
    chainId: 31337,
    address: "0x0000000000000000000000000000000000000001",
    deploymentBlock: 0n,
    publicClient: {
      getChainId: async () => 31337,
      readContract: async () => false,
      simulateContract: async () => ({}),
      estimateContractGas: async () => 100n,
    },
    walletClient: {
      account: { address: "0x0000000000000000000000000000000000000002" },
      writeContract: send,
    },
  } as unknown as ChainContext;
  await expect(postReview(receipt, 5, "x", { context })).rejects.toMatchObject({
    code: "TX_FAILED",
  });
  expect(send).toHaveBeenCalledTimes(1);
});
it("returns TX_PENDING and the broadcast hash on confirmation timeout", async () => {
  const hash = hashText("tx");
  const context = {
    chainId: 31337,
    address: "0x0000000000000000000000000000000000000001",
    deploymentBlock: 0n,
    publicClient: {
      getChainId: async () => 31337,
      readContract: async () => false,
      simulateContract: async () => ({}),
      estimateContractGas: async () => 100n,
      waitForTransactionReceipt: async () => {
        throw new Error("timeout");
      },
    },
    walletClient: {
      account: { address: "0x0000000000000000000000000000000000000002" },
      writeContract: async () => hash,
    },
  } as unknown as ChainContext;
  await expect(postReview(receipt, 5, "x", { context })).rejects.toMatchObject({
    code: "TX_PENDING",
    txHash: hash,
  });
});
