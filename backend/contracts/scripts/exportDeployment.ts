// Persist public, reproducible deployment metadata; never store provider URLs or keys.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../../sdk/src/config/env.js";
export interface Deployment {
  chainId: number;
  address: string;
  deployer: string;
  txHash: string;
  blockNumber: string;
  compilerVersion: string;
  optimizer: { enabled: boolean; runs: number };
  abiHash: string;
  deployedAt: string;
}
export function exportDeployment(entry: Deployment, local: boolean) {
  const path = join(
    ROOT,
    "backend",
    local ? ".local-deployment.json" : "deployments.json",
  );
  let all: Record<string, Deployment> = {};
  if (!local) {
    try {
      all = JSON.parse(readFileSync(path, "utf8"));
    } catch {
      /* first deployment */
    }
  }
  writeFileSync(
    path,
    JSON.stringify(
      local ? entry : { ...all, [entry.chainId]: entry },
      null,
      2,
    ) + "\n",
  );
}
