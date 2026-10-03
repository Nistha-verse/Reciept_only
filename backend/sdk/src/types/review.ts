// Public chain options and result types; quantities remain bigint in the SDK.
import type { Address, Hex, PublicClient, WalletClient } from "viem";
export interface ChainContext {
  publicClient: PublicClient;
  walletClient?: WalletClient;
  address: Address;
  deploymentBlock: bigint;
  chainId: number;
}
export interface ChainOptions {
  context?: ChainContext;
}
export interface PostOptions extends ChainOptions {
  demoSalt?: string;
  timeoutMs?: number;
}
export interface ReadOptions extends ChainOptions {
  merchantId?: Hex;
  fromBlock?: bigint;
  includeSmoke?: boolean;
  noCache?: boolean;
}
export interface PostedReview {
  reviewId: bigint;
  txHash: Hex;
  blockNumber: bigint;
  explorerUrl: string;
}
export interface Review extends PostedReview {
  merchantId: Hex;
  merchantName: string;
  nullifier: Hex;
  rating: number;
  text: string;
  postedAt: bigint;
  logIndex: number;
}
export interface MerchantSummary {
  merchantId: Hex;
  merchantName: string;
  count: bigint;
  average: number;
}
