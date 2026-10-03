// Simulation and gas estimation happen before a single send attempt.
import type { Hex } from "viem";
import type { ChainContext } from "../types/review.js";
import { contract } from "./contract.js";
import { bufferedGas } from "./gas.js";
import { retry } from "../utils/retry.js";
import { ReceiptsError } from "../errors/ReceiptsError.js";
export async function simulate(
  context: ChainContext,
  nullifier: Hex,
  merchantId: Hex,
  rating: number,
  text: string,
) {
  const account = context.walletClient?.account;
  if (!account) throw new ReceiptsError("ENV_INVALID");
  const params = {
    ...contract(context),
    functionName: "postReview" as const,
    args: [nullifier, merchantId, rating, text] as const,
    account,
  };
  await retry(() => context.publicClient.simulateContract(params));
  const gas = bufferedGas(
    await retry(() => context.publicClient.estimateContractGas(params)),
  );
  return { ...params, gas, chain: context.walletClient!.chain };
}
