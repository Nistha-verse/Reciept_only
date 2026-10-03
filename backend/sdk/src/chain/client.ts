// Node-only clients; credentials originate only in local .env and never reach UI.
import {
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
  type PublicClient,
  type WalletClient,
  type Transport,
  type Chain,
  type Account,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadEnv } from "../config/env.js";
import { baseSepolia, hardhat } from "../config/chains.js";
import type { ChainContext } from "../types/review.js";
import { ReceiptsError } from "../errors/ReceiptsError.js";
export function createClients(local = process.env.RECEIPTS_LOCAL === "1"): {
  publicClient: PublicClient;
  walletClient: WalletClient<Transport, Chain, Account>;
  chainId: number;
} {
  const env = loadEnv();
  const chain: Chain = local ? hardhat : baseSepolia;
  const url = local ? "http://127.0.0.1:8545" : env.rpcUrl;
  const publicClient = createPublicClient({
    chain,
    transport: http(url, { retryCount: 0, timeout: 15000 }),
  });
  const walletClient = createWalletClient({
    chain,
    account: privateKeyToAccount(env.privateKey),
    transport: http(url, { retryCount: 0, timeout: 15000 }),
  });
  return { publicClient, walletClient, chainId: chain.id };
}
export function getContext(
  local = process.env.RECEIPTS_LOCAL === "1",
): ChainContext {
  try {
    const clients = createClients(local);
    const file = join(
      ROOT,
      "backend",
      local ? ".local-deployment.json" : "deployments.json",
    );
    const all = JSON.parse(readFileSync(file, "utf8"));
    const entry = local ? all : all[String(clients.chainId)];
    if (
      !entry ||
      !isAddress(entry.address) ||
      Number(entry.chainId) !== clients.chainId
    )
      throw new Error();
    return {
      ...clients,
      address: entry.address,
      deploymentBlock: BigInt(entry.blockNumber),
    } as ChainContext;
  } catch (error) {
    if (error instanceof ReceiptsError) throw error;
    throw new ReceiptsError("ENV_INVALID");
  }
}
