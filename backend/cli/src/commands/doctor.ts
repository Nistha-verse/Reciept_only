// Safe public diagnostics; never print wallet keys, environment values or RPC URLs.
import { formatEther } from "viem";
import { getContext } from "../../../sdk/src/chain/client.js";
import { contract } from "../../../sdk/src/chain/contract.js";
import { readDnsCache } from "../../../sdk/src/verify/dnsCache.js";
import { ReceiptsError } from "../../../sdk/src/errors/ReceiptsError.js";
export async function doctor() {
  const ctx = getContext(),
    address = ctx.walletClient!.account!.address;
  const chainId = await ctx.publicClient.getChainId();
  if (chainId !== ctx.chainId) throw new ReceiptsError("ENV_INVALID");
  const code = await ctx.publicClient.getCode({ address: ctx.address });
  if (!code || code === "0x") throw new ReceiptsError("ENV_INVALID");
  return {
    envPresent: true,
    chainId,
    deployer: address,
    balanceETH: formatEther(await ctx.publicClient.getBalance({ address })),
    contractAddress: ctx.address,
    contractHasCode: true,
    reviewCount: await ctx.publicClient.readContract({
      ...contract(ctx),
      functionName: "reviewCount",
    }),
    dnsCachedKeys: Object.keys(readDnsCache()).length,
  };
}
