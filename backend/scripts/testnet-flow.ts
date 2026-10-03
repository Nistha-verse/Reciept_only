// Release-only chain smoke and honest signed synthetic receipt fallback; no email upload.
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getContext } from "../sdk/src/chain/client.js";
import { hashText } from "../sdk/src/utils/hash.js";
import { postReview } from "../sdk/src/chain/postReview.js";
import { getReviews, smokeMerchantId } from "../sdk/src/reviews/reader.js";
import { verifyReceipt } from "../sdk/src/verify/verifyReceipt.js";
import { synthetic } from "../sdk/tests/fixtures/synthetic.js";
import { main, execute, json } from "../cli/src/index.js";
import { sampleFiles } from "../cli/src/commands/inbox.js";
import { readSource } from "../cli/src/commands/verify.js";
import { ReceiptsError } from "../sdk/src/errors/ReceiptsError.js";
async function run() {
  const context = getContext(false);
  if ((await context.publicClient.getChainId()) !== 84532)
    throw new Error("Release flow requires Base Sepolia");
  const previousSmoke = (
    await getReviews({ context, includeSmoke: true, noCache: true })
  ).find((r) => r.merchantId === smokeMerchantId);
  const smoke =
    previousSmoke ??
    (await postReview(
      {
        nullifier: hashText(`deploy-smoke:${context.address}`),
        merchantId: smokeMerchantId,
        merchantName: "__deploy_smoke_test__",
        orderDate: new Date().toISOString(),
        providerId: "synthetic-smoke",
      },
      5,
      "deploy smoke test",
      { context },
    ));
  console.log("SMOKE TRANSACTION", smoke.explorerUrl);
  async function waitForReadback(hash: string, includeSmoke = false) {
    for (let i = 0; i < 30; i++) {
      const rows = await getReviews({ context, includeSmoke, noCache: true });
      if (rows.some((r) => r.txHash === hash)) return rows;
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new ReceiptsError("TX_PENDING", hash as `0x${string}`);
  }
  const all = await waitForReadback(smoke.txHash, true);
  const visible = await getReviews({ context, noCache: true });
  if (
    !all.some((r) => r.txHash === smoke.txHash) ||
    visible.some((r) => r.txHash === smoke.txHash)
  )
    throw new Error("Smoke visibility invariant failed");
  console.log("SMOKE readback passed; hidden by default.");
  await main(["doctor", "--json"]);
  let accepted: string | undefined;
  for (const item of sampleFiles()) {
    try {
      await verifyReceipt(readSource(item.path));
      accepted = item.path;
      break;
    } catch (error) {
      console.log(
        "Local sample classification:",
        error instanceof ReceiptsError ? error.code : "FAILED",
      );
    }
  }
  const dir = mkdtempSync(join(tmpdir(), "receipts-testnet-"));
  try {
    let options = {};
    if (!accepted) {
      console.log(
        "SYNTHETIC RECEIPT FALLBACK: no valid supported local receipt; injected test DNS, not Zomato's real key.",
      );
      const f = await synthetic({
        messageId: `<testnet-${context.address}@zomato.com>`,
        date: new Date(Date.now() - 3600000),
      });
      accepted = join(dir, "synthetic.eml");
      writeFileSync(accepted, f.raw, { mode: 0o600 });
      options = { resolver: f.resolver };
    }
    if (await main(["verify", accepted, "--json"], options))
      throw new Error("Release verify failed");
    const posted = (await execute(
      [
        "post",
        accepted,
        "4",
        "Synthetic signed receipt test on Base Sepolia",
        "--json",
      ],
      options,
    )) as any;
    console.log("RECEIPT TRANSACTION", posted.explorerUrl);
    console.log(json(posted));
    const rows = await waitForReadback(posted.txHash);
    if (!rows.some((r) => r.txHash === posted.txHash))
      throw new Error("Receipt readback failed");
    console.log("Receipt event readback passed.");
    if (
      (await main(
        ["post", accepted, "4", "Replay must fail", "--json"],
        options,
      )) !== 1
    )
      throw new Error("Replay was accepted");
    const original = readSource(accepted);
    const split = original.indexOf("\r\n\r\n");
    if (split < 0 || split + 4 >= original.length)
      throw new Error("No body to tamper");
    const copy = Buffer.from(original);
    copy[split + 4] = copy[split + 4] === 88 ? 89 : 88;
    const tampered = join(dir, "tampered-copy.eml");
    writeFileSync(tampered, copy, { mode: 0o600 });
    try {
      await execute(["verify", tampered, "--json"], options);
      throw new Error("Tampered source accepted");
    } catch (error) {
      if (!(error instanceof ReceiptsError) || error.code !== "TAMPERED")
        throw new Error("Unexpected tamper result");
      console.log("TAMPERED: changed body copy rejected; original untouched.");
    }
    for (const hash of [smoke.txHash, posted.txHash]) {
      const r = await context.publicClient.getTransactionReceipt({ hash });
      console.log(
        json({
          txHash: hash,
          gasUsed: r.gasUsed,
          blockNumber: r.blockNumber,
          status: r.status,
        }),
      );
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
run().catch((error) => {
  console.error(
    error instanceof ReceiptsError
      ? `${error.code}: ${error.message}`
      : "TESTNET_FLOW_FAILED: transaction or release invariant failed; inspect printed hashes before retrying. Sensitive dependency details suppressed.",
  );
  process.exitCode = 1;
});
