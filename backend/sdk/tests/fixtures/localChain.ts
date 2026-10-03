// Start an isolated local node without printing Hardhat's development private keys.
import { spawn } from "node:child_process";
import { join } from "node:path";
import { ROOT } from "../../src/config/env.js";
import { createClients, getContext } from "../../src/chain/client.js";
import { deploy } from "../../../contracts/scripts/deploy.js";
export async function localChain() {
  const child = spawn(
    process.execPath,
    [
      join(ROOT, "node_modules/hardhat/internal/cli/cli.js"),
      "node",
      "--hostname",
      "127.0.0.1",
    ],
    { cwd: join(ROOT, "backend/contracts"), stdio: "ignore" },
  );
  const stop = () => {
    child.kill("SIGTERM");
  };
  const { publicClient, walletClient } = createClients(true);
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      if (child.exitCode !== null)
        throw new Error("Local node failed; port 8545 may already be occupied");
      try {
        if ((await publicClient.getChainId()) === 31337) {
          ready = true;
          break;
        }
      } catch {
        /* wait for local startup */
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    if (!ready) throw new Error("Local node startup timed out");
    await publicClient.request({
      method: "hardhat_setBalance" as any,
      params: [walletClient.account.address, "0x56BC75E2D63100000"] as any,
    });
    await deploy(true);
    return { context: getContext(true), stop };
  } catch (error) {
    stop();
    throw error;
  }
}
