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

### Phase 5 evidence

- SDK suite now **34 passed, one skipped**, including send-once and confirmation
  timeout tests. No send is retried automatically.
- CLI implements doctor, verify, post, read, merchants, inbox, demo-seed; flags
  include `--json`, `--offline`, `--local`, and explicit `post --demo`.
- CLI typecheck passed. `npm run test:local` started a quiet localhost Hardhat
  node, deployed, and passed **8 expected CLI outcomes**: doctor, signed synthetic
  verify/post/read/merchant stats, ALREADY_USED, TAMPERED, and salted demo reuse.
- Synthetic files were generated in an OS temp directory and deleted afterward.
  No real email content was displayed. Inbox sender metadata is domain-only;
  subjects are returned only by the explicit local inbox interface.

### Phase 6 evidence

- Fastify injection tests: **8 passed**. Real synthetic DKIM verification runs
  inside requests; only the chain send is mocked in API unit tests (real chain
  integration is separately covered by SDK/CLI tests).
- Tested startup refusal, non-loopback peers, foreign origins, DNS-rebinding Host
  headers, preflight headers, input schemas, body limit, rate limiting, replay
  status, safe errors, and verify-before-send ordering.
- Initial API typecheck found that dotenv's spread lost the environment index
  signature; added an explicit return type. Typecheck and backend lint now pass.
- Removed deprecated Fastify `disableRequestLogging` option after its warning;
  `logger: false` disables logging entirely, including bodies and request lines.

### Phase 7 documentation

README, ARCHITECTURE, SECURITY, API, STAGE2 and DEMO now document the actual local
flow, exact exported types, endpoint/error contracts, key/cache trust, direct-call
bypass, front-running, wallet linkability and permanent text. Stage 2 signal
indices are labeled a proposed future spec, not an implemented verifier ABI.
Order-template semantics and merchant extraction are explicitly unvalidated;
the non-Zomato sample is not presented as a real purchase. Release evidence follows.

**Status: Phases 0–9 complete; Base Sepolia deployed and source verified; final checks passed.**
The local key was valid bare hexadecimal. Initial strict prefix validation failed;
trimming and adding `0x` in memory resolved it without modifying `.env`.
RPC returned chain ID `84532`. Deployer: `0xacF417A24944A588e22f2bF5EDA211c63D66C9bF`.
Initial balance: `0.0001` ETH. Restored the deleted placeholder-only `.env.example`.
Missing-environment evidence below is historical, from the first attempt.

### Phase 8 Base Sepolia release evidence

- Re-ran contract suite before deploy: **17 passing**. Rechecked chain ID 84532
  and balance 0.0001 ETH. No zero-balance polling was necessary.
- Deployment dry-run: buffered 484380 gas, estimated execution fee 0.00000290628
  ETH, explicitly excluding variable L1 data fees.
- Contract: <https://sepolia.basescan.org/address/0xd5590616ba215de3c973d8cbc31ec4f35cc1f4d9>
- Deploy: <https://sepolia.basescan.org/tx/0xdc3e4b6b45e4fd2303ba265da36fab99650584851cf0d88588af299698fbb125>
  at block 47627081, actual gas **399314**. Public reproducibility metadata is in
  `backend/deployments.json`.
- Sanity output: runtime matches artifact, SDK ABI matches, five ABI selectors
  present, reviewCount=0, random merchant stats=(0,0).
- Source verification: **VERIFIED on Basescan**. Initial Node fetch timed out
  (`ETIMEDOUT`); curl via stdin succeeded as a second transport. Initial V2 POST
  parameters were rejected; moving `chainid=84532` into the query resolved the
  API requirement. The script submitted standard compiler JSON and polled success.
  Credentials were never printed or placed in process arguments.
- SDK ABI re-synchronized; **34 SDK tests passed, one opt-in test skipped** then.
- Exactly one smoke review:
  <https://sepolia.basescan.org/tx/0x7808bbdf9edf2b1df4c28ff5da24f1cf071036c524406d245a14580572a201d4>
  block 47627102, gas **161519**. Its first immediate reader visibility assertion
  failed. A later read-only diagnostic found reviewCount=1 and the exact event,
  confirming RPC/indexing visibility lag; default visible count was zero. The
  release flow now polls reads and reuses the existing smoke event, never sends
  another smoke review. Readback and default hiding passed.
- `cli doctor` passed on Base Sepolia with public address, deployed code,
  reviewCount=1, balance 0.000096560553399187 ETH at that point.
- The only real sample's lookup returned DNS_UNAVAILABLE; structural inspection
  already established it is not Zomato. No real-purchase verification is claimed.
- Explicit **synthetic signed receipt fallback**, using a generated RSA key and
  injected DNS, posted:
  <https://sepolia.basescan.org/tx/0x3111abdbb7ffa5a8392db3488d672ee4b291a008cac9087ea683ac1e2ea0159f>
  block 47627178, gas **145166**. Reader found the event; a repeat post returned
  ALREADY_USED; a one-character body change in a temporary copy returned TAMPERED.
  The copy was deleted. This is a real chain transaction, not a real purchase.
- Review found a potential policy mix-up if an invalid duplicate DKIM header reused
  the passing signature's `b=` value with a different `h=` list. Policy now uses
  mailauth's actual verified signing-header keys, with a regression test.
- Full typecheck exposed an ethers BaseContract `.connect()` typing issue in a
  test; using the typed function accessor resolves it without changing runtime.

### Phase 9 clean-state verification (first pass)

Deleted root/workspace node_modules, Hardhat artifacts/cache/generated types and
SDK dist, then ran from the committed tree:

```text
npm ci                           added 813 packages in 25s
npm run typecheck                all four packages + release/tool scripts passed
npm run lint                     passed
npm run format:check             All matched files use Prettier code style!
npm run test:contracts           17 passing; compiled from scratch; gas unchanged
npm run test:sdk                 35 passed, 1 opt-in test skipped
npm run test:api                 8 passed
npm run test:local               CLI SMOKE: 8 expected outcomes passed
npm run check:secrets            passed: 118 tracked paths
git status                      nothing to commit, working tree clean
```

npm still reports deprecated transitive glob/inflight/uuid/lodash.isequal and
ESLint 9 packages and unapproved optional native install scripts. The clean
install, compiler, TypeScript executor and required test commands nevertheless
ran successfully. Versions remain locked; no install policy was overridden.

### Written source self-review

Reviewed every contract/SDK source concern against the Stage 1 trust boundary:

- `contracts/ReceiptsReviews.sol`: exact ordered errors, atomic checked effects,
  compact records, text/event hash integrity, no interactions/admin/upgrade path.
  Arbitrary direct-call nullifiers and unbound front-running remain intentional
  limitations; 1120 bytes is not a contract-level codepoint limit.
- `contracts/hardhat.config.ts`: pinned local compiler, optimizer/target match
  release settings; local network only, no wallet credentials in Hardhat output.
- `contracts/scripts/deploy.ts`: estimate then single deployment send, receipt
  status checked, public metadata only; never auto-retry an uncertain deployment.
- `contracts/scripts/exportDeployment.ts`: local/testnet records separate; no
  credentials. A caller must inspect existing deployment before running a new one.
- `contracts/scripts/postDeploySanity.ts`: exact runtime and ABI equality, empty
  initial count, unknown stats; after-smoke mode intentionally permits count > 0.
- `contracts/scripts/verify.ts`: credentials loaded locally and submitted to the
  explorer, not logged or put in argv; source and metadata are public. Curl
  fallback and V2 chain query were actually exercised successfully.
- `sdk/src/index.ts`: exactly four public functions plus errors and type exports;
  Node-only implementation, no misleading browser or proof capability.
- `config/env.ts`: file-only credentials, valid scalar via viem, prefix normalized
  in memory, failures sanitized. Node package/root discovery is local filesystem.
- `config/chains.ts`: Base Sepolia and explicit local chain; no silent mainnet.
- `config/constants.ts`: bounded email/review limits and reserved smoke name.
- `config/providers.ts`: domain boundaries are explicit; merchant pattern disabled
  until a real sample is reviewed; adding a provider is config-driven.
- `types/email.ts`: injectable clock/resolver are trusted local test seams, never
  user-controlled bridge fields. `types/receipt.ts`: no raw email in the result.
  `types/review.ts`: bigint quantities, explicit context and demo options.
- `errors/codes.ts`: stable codes. `messages.ts`: fixed, non-sensitive UI text.
  `ReceiptsError.ts`: no raw nested cause. `decodeRevert.ts`: bounded nested decode,
  all seven contract errors tested, unknowns sanitized.
- `email/normalizeRaw.ts`: only string bare-LF replacement; buffers unchanged.
  `parseEml.ts`: separate unfolded header view, bounded header/signature count,
  duplicate security-relevant fields fail closed, no source mutation.
- `email/extractMetadata.ts`: conservative mailbox and unique Message-ID/date
  extraction; unusual valid mailbox syntax can be rejected rather than guessed.
  `extractMerchant.ts`: only configured fixed subject templates, currently safe
  fallback. `checkFreshness.ts`: inclusive 90-day boundary and strict future check.
- `verify/verifyDkim.ts`: actual mailauth strict signature verification and safe
  DNS error mapping. Final review additionally stripped raw selected headers,
  signatures and public-key payloads from even the internal policy result.
- `verify/dkimPolicy.ts`: algorithm/key/domain/full-body/actual signed-header
  coverage. Duplicate-b policy-mixing issue fixed and regression tested.
- `verify/verifyReceipt.ts`: ordered pipeline, no raw output, policy only on
  cryptographic passes, no on-chain enforcement claim.
- `verify/deriveNullifier.ts`: specified packed encoding and Message-ID casing;
  domain-scoped identifier is intentionally not a review-bound commitment.
- `verify/dnsCache.ts`: only public TXT records, explicit stale offline trust,
  bounded online cache lifetime. Final review found concurrent read-before-await
  writes could discard a second key; merging after the lookup fixes lost entries
  and has a regression test. File access failure fails verification closed.
- `chain/client.ts`: wallet material stays in Node and .env; HTTP send retries
  disabled. `abi.ts`: generated artifact, checked against deployed runtime release.
  `contract.ts`: shared ABI/address wrapper. `gas.ts`: rounded-up 20% buffer.
- `chain/simulate.ts`: simulate and estimate are idempotent; account required.
  `postReview.ts`: validate, chain-check, precheck, simulate, one send, bounded wait,
  event matching, cache invalidation. TX_PENDING retains the known hash; uncertain
  sends require manual chain inspection. Explicit demo salt is visibly logged.
- `reviews/reader.ts`: deployment lower bound, adaptive shrinking, tx/log dedupe,
  ordering, smoke hiding, stats views; latest RPC height cache disabled. RPC
  indexing lag and reorgs are not a production finality/indexing solution.
- `reviews/merchants.ts`: only hash-consistent locally learned names; unknown hashes
  are not guessed. Registry write failure affects display only. `cache.ts`: bounded
  five-second cache, invalidated by posts; no raw email or credentials stored.
- `utils/logger.ts`: fixed event names, allowlisted fields, sensitive/unknown fields
  redacted, no request bodies. `hash.ts`: UTF-8 keccak with specified normalization.
  `text.ts`: codepoints and byte bounds, whole rating, no empty whitespace review.
  `retry.ts`: transient idempotent reads only; `assert.ts`: stable errors only.

Review of docs/CLI/bridge additionally confirmed: no runtime AI service, no claims
of email verification by the contract, no anonymity guarantee, no request logging,
loopback/Host/origin checks, no forwarded-address trust, no remote email upload,
schema and size limits, rate limits, no browser key/nullifier input, safe JSON.

### Deviations and scope limits

- Extra supporting files include tooling TypeScript config, local/testnet flow
  scripts and an ESM marker for release scripts inside the CommonJS Hardhat project.
  Existing frontend and historical ZKEMAIL_NOTES stayed unchanged.
- Tests are organized by security module and meaningful integrated behavior;
  trivial type/config/wrapper files are covered by typechecks and integration,
  rather than creating one redundant unit-test file for every source module.
- Real receipt path was unavailable: the sole sample is non-Zomato and its first
  live DNS check failed. The testnet receipt transaction is explicitly synthetic.
- Merchant extraction/order-template semantics remain unvalidated and fallback
  groups accepted Zomato mail under one merchant. This is not hidden as success.
- The SDK is local Node, not browser DKIM. The bridge is development-only and
  does not provide authentication against hostile software on the same device.
- Five-second caching and bounded log pagination are demo-scale; no production
  reorg indexer, distributed transaction coordinator, moderation or private relayer.

### Final post-review verification

After the internal-result redaction and concurrent-DNS-cache corrections:

```text
npm run typecheck                passed (all packages and tooling)
npm run lint                     passed
npm run format:check             All matched files use Prettier code style!
npm run test:contracts           17 passing; gas report unchanged
npm run test:sdk                 38 passed, 1 opt-in test skipped
npm run test:api                 8 passed
npm run test:local               CLI SMOKE: 8 expected outcomes passed
npm run check:secrets            passed
npm run build -w @receipts-only/sdk
                                ESM Build success; DTS Build success
```

The new tests check internal DKIM-result redaction, concurrent cache entries, and
actual offline signature verification from a previously cached synthetic public key.

Additional read-only/explicit checks actually run:

- Base Sepolia doctor: chain ID 84532, code present, reviewCount **2**, deployer
  balance **0.000095679358076605 ETH** at the final check.
- `cli demo-seed --json`: **posted 0, skipped 1, TAMPERED**. After DNS keys became
  available, the historical non-Zomato sample failed strict DKIM verification.
  This code does not prove who altered it or when; no original was modified here.
- `RUN_REAL_SAMPLES=1 npm test -w @receipts-only/sdk -- tests/realSamples.test.ts`:
  **1 classification test passed**, reporting TAMPERED only. This is explicitly
  not a successful real-email authenticity test.
- Post-smoke sanity: runtime and ABI still match, count 2, random stats zero.
- Follow-up source verification: **ALREADY_VERIFIED / VERIFIED**. Flattened
  single-file source regenerated under ignored Hardhat artifacts after clean build.
- `git ls-files | grep -E "\.eml$|\.env$"`: no matches (grep exit 1).
- Diff from the prior handoff for `frontend/` and `docs/ZKEMAIL_NOTES.md`: empty.
- No pushes were performed. Final phase commit contains the written source review
  and corrections; repository cleanliness is checked after committing.

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
