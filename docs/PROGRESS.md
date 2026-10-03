# Progress

## Current run — Stage 1 (2026-10-03)

### Phase 1–2 evidence (resumed run)

- npm workspace reconciliation passed typechecking for all four packages.
- Pinned Hardhat 2.28.6/toolbox 6.0.0 and solc-js 0.8.24; compilation uses the
  installed compiler, optimizer 200, Paris EVM. Foundry is not required.
- Installed mailauth 7.1.0 for local DKIM and Fastify 5.12.5 for the bridge.
- npm emitted transitive deprecation and install-script-policy warnings; install
  succeeded. Required Hardhat binaries worked without overriding that policy.
- `npm run test:contracts`: **17 passing**, including 200 random valid posts and
  per-post aggregate checks. Compiler output: `Compiled 1 Solidity file successfully`.
- Measured local gas: deployment **399314**; first merchant, one-byte text
  **161339**; existing merchant, 280 ASCII bytes **133691**; existing merchant,
  1120 UTF-8 bytes **154149**. These are different state scenarios, not a text-only
  comparison. Base Sepolia measurements remain pending.
- `command -v slither` returned no executable. Manual review: no external calls
  or interaction/reentrancy path; checked uint128 sums/counts revert atomically
  at unreachable practical bounds; timestamp narrowing is safe until year-scale
  uint64 exhaustion; input length caps bound per-call work; no unbounded storage
  iteration; event fields and text hash derive from identical calldata. No admin,
  ownership, upgrade, payable, delegatecall, or destruction mechanism exists.
  Mempool nullifier theft/front-running and arbitrary direct-call nullifiers are
  real Stage 1 limitations. The contract byte limit does not enforce 280 Unicode
  codepoints; that is an SDK rule.

### Phase 3 evidence

- Real mailauth signature verification with strict mode and injected DNS: **20
  tests passed, one real-sample test skipped by default**. Generated 2048-bit RSA
  fixtures cover body/header tampering, sender alignment, missing signed headers,
  body-length tags, weak RSA, duplicate headers, freshness, and LF paste handling.
- File byte buffers are never normalized; pasted strings only replace bare LF
  with CRLF. Header unfolding affects a parsing view, never cryptographic input.
- Only the matching passing signature supplies policy fields; no cross-signature
  policy mixing. Duplicate From/Subject/Date/Message-ID headers fail closed.
- Online DKIM keys are cached locally for 24h; explicit offline reuse can be stale.
  The one local sample is unsupported and no real Zomato merchant rule exists;
  fallback remains `Zomato order` with the required unvalidated-template marker.
- First SDK typecheck reported `TS2322` on `Object.fromEntries` returning unknown
  cache values. The cache's validated entries now receive an explicit Cache type.

### Phase 4 evidence

- Artifact-generated SDK ABI, viem clients, simulation + 20% gas margin, single
  send, bounded receipt wait, all custom-error mappings, paginated reader, cache,
  local merchant registry, and explicit salted demo mode implemented.
- `npm run test:sdk`: **32 passed, one skipped** after fixing a real integration
  failure (`expected 1 to be 2`): viem cached the latest block height after a
  second confirmed post. Reader now requests `cacheTime: 0` for block height.
- Typecheck initially hit viem inferred-declaration/OP-chain union incompatibility
  (`TS2742`, then `TS2719`). Explicit standard `Chain` and client return types
  resolved it. SDK typecheck now passes.
- Local Hardhat integration used the .env account funded only inside the test
  node; default Hardhat private keys were never printed. Deployment, post,
  readback, replay rejection, demo-salted reuse and view-backed average all passed.
- Mocked range-shrinking/deduplication/smoke filtering and every custom error
  selector passed. Separate send-uncertainty tests are included for the next run.

**Status: resumed; Phase 0 environment check passed. Implementation in progress.**
The local key was valid bare hexadecimal. Initial strict prefix validation failed;
trimming and adding `0x` in memory resolved it without modifying `.env`.
RPC returned chain ID `84532`. Deployer: `0xacF417A24944A588e22f2bF5EDA211c63D66C9bF`.
Initial balance: `0.0001` ETH. Restored the deleted placeholder-only `.env.example`.
No deployment or feature test result is claimed yet. Missing-environment evidence
below is historical, from the first attempt.

### Phase 0 completed work

- Inspected the clean starting tree, all three existing commits, every existing
  contract/SDK/CLI module, manifests, scripts, and historical notes.
- Wrote `docs/INSPECTION.md` with a keep/rewrite/remove inventory.
- Removed comment-only Foundry/proof/sandbox/Gmail placeholders and the unused
  `@zk-email/sdk` dependency. Preserved `docs/ZKEMAIL_NOTES.md` unchanged.
- Strengthened `.gitignore`, replaced environment examples with Stage 1
  placeholders, and strengthened the tracked-secret checker without logging
  matched contents. Its 32-byte-literal rule is deliberately conservative.
- Replaced inaccurate README claims and recorded the central direct-call bypass
  and wallet-linkability limitations in preliminary `docs/SECURITY.md`.
- Preserved `frontend/` and all `samples/` contents unchanged.
- Inspected one ignored email structurally: signing/From domain `succinct.xyz`,
  selector `google`, algorithm `rsa-sha256`, no `l=`, with Subject/Date/Message-ID
  signed. It is not a Zomato receipt. Merchant-template checks did not match;
  no production merchant pattern is validated.

### Actual command evidence

```text
node -v
v24.10.0
npm -v
11.19.1
git --version
git version 2.43.0

npm install --ignore-scripts
removed 159 packages, and changed 1 package in 2s

npm install
changed 1 package in 308ms

npm run typecheck --workspace @receipts-only/sdk
tsc --noEmit
[exit 0]

npm run typecheck --workspace @receipts-only/cli
tsc --noEmit
[exit 0]

git check-ignore samples/official-residency.eml .env .env.local .dkim-cache/keys.json
samples/official-residency.eml
.env
.env.local
.dkim-cache/keys.json

git diff --check
[no output; exit 0]

npm run check:secrets
Secret tracking check passed: 59 tracked paths; no email files, environment secrets, or private-key patterns.

npx prettier --check backend/scripts/check-secrets.ts README.md docs/INSPECTION.md docs/SECURITY.md docs/PROGRESS.md backend/sdk/package.json
Checking formatting...
All matched files use Prettier code style!

git ls-files | grep -E "\.eml$|\.env$"
[no output; grep exit 1 means no matches]

git diff --cached --name-only -- frontend docs/ZKEMAIL_NOTES.md samples
[no output; exit 0]

read-only local audit
Local .eml count: 1
HARD BLOCKER: .env is absent; BASE_SEPOLIA_RPC_URL and DEPLOYER_PRIVATE_KEY are unavailable. Address, chain ID, and balance cannot be checked.
[exit 2]
```

The audit script was temporary tooling outside the repository. It did not alter
or transmit sample files. It did not perform DKIM verification.

The first targeted formatting check reported `Code style issues found in 2
files` (`docs/INSPECTION.md` and `docs/PROGRESS.md`). The cause was unaligned
Markdown tables; converting the inventories to lists fixed it, and the rerun
passed. This was a targeted Phase 0 check, not Phase 9 final verification.

`npm install` warned that `esbuild@0.28.2` and `esbuild@0.27.7` install scripts are
not covered by this environment's npm `allowScripts` policy. Installation and the
two scaffold typechecks succeeded. No policy override was made; later build
phases must check whether any required binary setup is affected.

### Dependency choices

- **TypeScript, tsx — retained:** Strict types and local TypeScript scripts.
- **viem — retained:** Typed Base Sepolia clients, ABI codecs, hashing, transaction simulation.
- **zod — retained:** Runtime validation of environment and API inputs.
- **Vitest — retained:** SDK/API unit and integration tests with injected clocks/resolvers.
- **tsup — retained:** SDK package bundling and declarations.
- **Prettier — retained:** Reproducible source formatting.
- **Hardhat + toolbox — planned for Phase 1:** Solidity compilation/testing and deployment without Foundry; select compatible versions together.
- **mailauth — planned for Phase 3:** Local DKIM cryptographic verification with injectable DNS.
- **Fastify — planned for Phase 6:** Localhost HTTP server, request injection testing, and body limits.
- **Small redacting logger — planned for Phase 4:** Explicit allowlisted output without raw emails or credentials.
- **`@zk-email/sdk` — removed:** No proof generation in Stage 1; historical research is preserved.

### Resume instructions

From the repository root:

```sh
cp -n .env.example .env
chmod 600 .env
nano .env
```

Set `BASE_SEPOLIA_RPC_URL` and `DEPLOYER_PRIVATE_KEY` in that local file. Do not put
the key or RPC URL in chat or shell command arguments. The key must be a valid
nonzero secp256k1 private key, encoded as `0x` followed by 64 hexadecimal
characters. The RPC must return chain ID `84532`.

Resume message: **"Resume Receipts Only at Phase 0 step 5; `.env` is ready. Follow
`docs/PROGRESS.md` and complete Phases 1–9 with the original requirements."**

On resumption, derive the address and inspect balance without displaying secrets.
If the balance is zero, proceed through non-deploy phases before the specified
three-minute Phase 8 funding poll. No balance or faucet blocker was established
in this run.

---

## Phase 0 — Preflight, project creation, and scaffold

- Status: complete with Foundry installation environment blocker recorded
- Node: v24.10.0
- Git: 2.43.0
- Foundry: official `foundryup` installed, but the v1.8.4 Linux binary download timed out repeatedly; `forge` remains unavailable.
- Repository creation: completed at `/home/hp/receipts-only`.
- `.gitignore`: created before project files.

### Phase 0 evidence

```text
npm install
added 102 packages in 23s

npm run check:secrets
Secret tracking check passed.

npm run typecheck --workspace @receipts-only/sdk
tsc --noEmit

npm run typecheck --workspace @receipts-only/cli
tsc --noEmit

touch samples/phase0-ignore-check.eml
git status --short --ignored -- samples/phase0-ignore-check.eml
!! samples/phase0-ignore-check.eml
```

The temporary ignored file was deleted immediately after the check. No email contents were created, printed, committed, or sent.

The Foundry installation evidence is:

```text
forge --version
/bin/bash: forge: command not found
```

The scaffold does not run Solidity tests yet because Phase 0 contains no contract implementation and the required compiler tool is unavailable.

## Phase 1 — zk-email spike

- Status: blocked; research completed, proof generation not completed.
- Installed official package: `@zk-email/sdk@2.0.11`.
- Official sample downloaded locally to ignored `samples/official-residency.eml` (7,485 bytes); contents were never printed or committed.
- Confirmed from current docs and installed SDK that external inputs are supported by the Blueprint SDK API.
- Local browser proving was selected. Remote proving was not used because it violates the product privacy constraint.
- Blocking evidence: official `conductor.zk.email` blueprint lookup returned HTTP 500 (`{"error":"Internal server error"}`) for the documented residency slug and the documented Luma blueprint; no circuit assets or verifier metadata were available.
- No browser runtime is installed in WSL, so the SDK's browser Worker/WASM local prover could not be executed after the registry failure.
- No official Zomato blueprint was found. The exact Zomato signal layout and verifier inputs remain unknown and must not be guessed.
- Retry evidence: `foundryup` again timed out downloading `foundry_v1.8.4_linux_amd64.tar.gz`; both official blueprint API URLs again returned HTTP 500.
- Full details: [`docs/ZKEMAIL_NOTES.md`](ZKEMAIL_NOTES.md).
