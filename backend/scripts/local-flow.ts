// One command starts an isolated node, deploys and exercises the real CLI functions.
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { localChain } from "../sdk/tests/fixtures/localChain.js";
import { synthetic, NOW } from "../sdk/tests/fixtures/synthetic.js";
import { main } from "../cli/src/index.js";
const dir = mkdtempSync(join(tmpdir(), "receipts-cli-synthetic-"));
const node = await localChain();
process.env.RECEIPTS_LOCAL = "1";
try {
  const f = await synthetic(),
    source = join(dir, "synthetic.eml"),
    tampered = join(dir, "synthetic-tampered.eml");
  writeFileSync(source, f.raw, { mode: 0o600 });
  writeFileSync(
    tampered,
    f.raw
      .toString()
      .replace("Synthetic order receipt.", "Synthetic order receipX."),
    { mode: 0o600 },
  );
  const opts = { resolver: f.resolver, now: () => NOW };
  const commands: [string[], number][] = [
    [["doctor", "--json"], 0],
    [["verify", source, "--json"], 0],
    [["post", source, "4", "Synthetic CLI review", "--json"], 0],
    [["read", "--json"], 0],
    [["merchants", "--json"], 0],
    [["post", source, "4", "Replay", "--json"], 1],
    [["verify", tampered, "--json"], 1],
    [
      [
        "post",
        source,
        "5",
        "Explicit synthetic demo reuse",
        "--demo",
        "--json",
      ],
      0,
    ],
  ];
  for (const [args, expected] of commands)
    if ((await main(args, opts)) !== expected)
      throw new Error(`CLI smoke failed at ${args[0]}`);
  console.log(
    "CLI SMOKE: 8 expected outcomes passed (synthetic signed fixtures, injected DNS).",
  );
} finally {
  node.stop();
  rmSync(dir, { recursive: true, force: true });
}
