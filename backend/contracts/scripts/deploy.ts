// Estimate and deploy once with the .env wallet; keep all transport errors redacted.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  encodeDeployData,
  formatEther,
  keccak256,
  toBytes,
  type Hex,
} from "viem";
import { ROOT } from "../../sdk/src/config/env.js";
import { createClients } from "../../sdk/src/chain/client.js";
import { bufferedGas } from "../../sdk/src/chain/gas.js";
import { ReceiptsError } from "../../sdk/src/errors/ReceiptsError.js";
import { exportDeployment } from "./exportDeployment.js";
export async function deploy(
  local = process.env.RECEIPTS_LOCAL === "1",
  dryRun = false,
) {
  const { publicClient, walletClient, chainId } = createClients(local);
  if ((await publicClient.getChainId()) !== chainId)
    throw new ReceiptsError("ENV_INVALID");
  const artifact = JSON.parse(
    readFileSync(
      join(
        ROOT,
        "backend/contracts/artifacts/contracts/ReceiptsReviews.sol/ReceiptsReviews.json",
      ),
      "utf8",
    ),
  );
  const account = walletClient.account;
  const data = encodeDeployData({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
  });
  const gas = bufferedGas(await publicClient.estimateGas({ account, data }));
  const gasPrice = await publicClient.getGasPrice();
  console.log(
    JSON.stringify({
      deploymentEstimate: {
        chainId,
        deployer: account.address,
        gas: gas.toString(),
        estimatedExecutionETH: formatEther(gas * gasPrice),
        note: "Estimate excludes variable Base L1 data fees",
      },
    }),
  );
  if (dryRun) return;
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode as Hex,
    gas,
  });
  console.log(
    local
      ? `Deployment transaction ${hash}`
      : `https://sepolia.basescan.org/tx/${hash}`,
  );
  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    timeout: 180000,
  });
  if (receipt.status !== "success" || !receipt.contractAddress)
    throw new ReceiptsError("TX_FAILED", hash);
  const entry = {
    chainId,
    address: receipt.contractAddress,
    deployer: account.address,
    txHash: hash,
    blockNumber: receipt.blockNumber.toString(),
    compilerVersion: "0.8.24+commit.e11b9ed9",
    optimizer: { enabled: true, runs: 200 },
    abiHash: keccak256(toBytes(JSON.stringify(artifact.abi))),
    deployedAt: new Date().toISOString(),
  };
  exportDeployment(entry, local);
  console.log(
    JSON.stringify({
      address: entry.address,
      gasUsed: receipt.gasUsed.toString(),
      explorer: local
        ? "local"
        : `https://sepolia.basescan.org/address/${entry.address}`,
    }),
  );
  return entry;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  deploy(undefined, process.argv.includes("--dry-run")).catch(() => {
    console.error(
      "DEPLOY_FAILED: check environment, balance and transaction state before retrying; details suppressed.",
    );
    process.exitCode = 1;
  });
}
