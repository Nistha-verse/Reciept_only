# Stage 1 scaffold inspection

Inspection date: 2026-10-03. Starting commit: `298838f`.

This is the historical pre-implementation inspection snapshot. Its missing-env
blocker was resolved on resumption; see `PROGRESS.md` for completed implementation,
deployment and final verification evidence.

## Findings

The starting worktree was clean. Its three commits created a scaffold and
documented unsuccessful zk-email/Foundry experiments. There was no implemented
contract, email verification, transaction pipeline, CLI command, or test suite.
Every Solidity source/test/script was a one-line comment. Most SDK and CLI files
were also one-line comments; the SDK exported only a version constant, and the
CLI router only printed a scaffold message.

Read during inspection: root and workspace package manifests, all existing
contract/SDK/CLI sources and configurations, repository scripts, deployment
placeholder, `.gitignore`, `.env.example`, README, and both existing progress
documents. The tracked-file inventory and depth-4 directory listing were
examined; dependency/build/cache directories were excluded from the tree.

## Original layout, depth 4

```text
receipts-only/
  .editorconfig
  .env.example
  .gitignore
  README.md
  package.json
  package-lock.json
  backend/
    cli/
      package.json
      tsconfig.json
      src/
        index.ts
        commands/
    contracts/
      foundry.toml
      remappings.txt
      script/
        ConfigureProviders.s.sol
        Deploy.s.sol
        DeploySandbox.s.sol
        VerifyDeployment.s.sol
      src/
        ReceiptsReviews.sol
        ReceiptsReviewsSandbox.sol
        errors/
        interfaces/
        libraries/
      test/
        Fuzz.t.sol
        Integration.t.sol
        Invariant.t.sol
        ReceiptsReviews.t.sol
        ReceiptsReviewsSandbox.t.sol
        ReviewBinding.t.sol
        SignalLayout.t.sol
        helpers/
        mocks/
    deployments/
      base-sepolia.json
    scripts/
      check-secrets.ts
      export-deployments.ts
      sync-abi.ts
    sdk/
      package.json
      tsconfig.json
      tsup.config.ts
      vitest.config.ts
      src/
        index.ts
        chain/
        config/
        email/
        errors/
        input/
        proof/
        reviews/
        services/
        types/
        utils/
      tests/
        fixtures/
  docs/
    PROGRESS.md
    ZKEMAIL_NOTES.md
  frontend/
    README.md
  samples/
    .gitkeep
    official-residency.eml (ignored, local only)
```

## Decisions and actions

- **npm workspace and lockfile — keep / reconcile:** SDK and CLI package identities are useful. Removed the unused zk-email dependency and refreshed the lockfile with npm. Hardhat and API workspaces remain Phase 1 work.
- **TypeScript, tsup, Vitest configurations — keep:** Real configuration, suitable starting points. Passing typechecks only establish scaffold consistency.
- **`.editorconfig` — keep:** Existing repository conventions.
- **`.gitignore` — rewrite:** Added environment variants, Hardhat outputs, generated types, logs, and local DKIM-cache exclusions. Retained existing ignored build paths.
- **`.env.example` — rewrite:** Stage 1 placeholders only; removed sandbox/Gmail settings and replaced the all-zero key with a textual placeholder.
- **`backend/contracts/foundry.toml`, `remappings.txt`, `src/**`, `script/**`, `test/**` — remove:** All obsolete Foundry/proof/sandbox placeholders, with no implementation to salvage. Hardhat needs no Foundry installation.
- **`backend/sdk/src/proof/**`, `types/proof.ts` — remove:** Unused proof-generation and signal-layout placeholders. No on-chain proof verification in Stage 1.
- **`backend/sdk/src/input/**` — remove:** Unimplemented Gmail/OAuth and browser-input scaffolding outside the requested Stage 1 layout.
- **`backend/sdk/src/services/**`, `email/validateReceipt.ts` — remove:** Unimplemented proof/sandbox orchestration. The new `verifyReceipt` and `postReview` pipelines replace it.
- **Remaining SDK `chain`, `config`, `email`, `errors`, `reviews`, `types`, `utils` files — rewrite in Phases 1, 3, 4:** Directory concerns are salvageable; comment-only modules contain no working logic. Reconcile obsolete filenames to the exact requested layout in Phase 1.
- **SDK `src/index.ts` — rewrite in Phase 4:** Replace version-only export with the requested public API once implemented.
- **CLI `prove.ts`, `resetSandbox.ts` — remove:** No proof generation or sandbox contract in Stage 1.
- **Remaining CLI files — rewrite in Phase 5:** Useful command names, no implementation. Updated the demo placeholder to remove sandbox wording.
- **`backend/deployments/base-sepolia.json` — remove:** Null strict/sandbox addresses are not a real deployment. A generated `backend/deployments.json` belongs to Phase 8.
- **`backend/scripts/export-deployments.ts` — remove:** Empty obsolete path; deployment export belongs in the Hardhat scripts directory.
- **`backend/scripts/sync-abi.ts` — rewrite in Phase 4:** Corrected purpose comment to Hardhat; ABI export is still unimplemented.
- **`backend/scripts/check-secrets.ts` — rewrite:** Checks indexed and working-copy contents for conservative private-key patterns and rejects tracked emails, private sample files, and environment variants. Reports paths only.
- **README — rewrite:** Removed inaccurate anonymity and proving claims; explicitly describes the incomplete Stage 1 scaffold.
- **`docs/PROGRESS.md` — keep and append:** Preserve historical evidence and add the current hard blocker and resume instructions.
- **`docs/ZKEMAIL_NOTES.md` — keep unchanged as history:** Prior research, not the Stage 1 implementation or a current dependency.
- **`samples/**` — keep unchanged:** Private local material. No sample contents were printed, copied, transmitted, or modified.
- **`frontend/**` — keep unchanged:** Outside this run's scope.

## Toolchain and dependencies

Observed versions: Node `v24.10.0`, npm `11.19.1`, Git `2.43.0`.
The required Node minimum is satisfied. Existing workspace dependencies installed
successfully after removing `@zk-email/sdk`. No Foundry command is needed.

Dependency choices and their purposes are recorded in `PROGRESS.md`. No contract
compiler, DKIM verifier, or bridge has been installed or validated in this run.

## Environment hard blocker

There is no `.env` in the repository root. Therefore both required configuration
values are unavailable: `BASE_SEPOLIA_RPC_URL` and `DEPLOYER_PRIVATE_KEY`.
No key was generated or taken from another source. Key validity, the deployer
address, RPC chain ID, and wallet balance remain unverified. There was no RPC call
and no deployment. This is the user's explicit missing-environment hard blocker.

Resume at **Phase 0, step 5**, then execute Phases 1–9 in order.

## Private sample structural inspection

One local `.eml` exists. It is the historical residency example, not a Zomato
receipt. The audit parsed it locally and emitted only allowed structural facts:

- DKIM `d=succinct.xyz`, `s=google`, `a=rsa-sha256`.
- Signed headers: `cc:subject:message-id:date:from:mime-version:from:to:cc:subject:date:message-id:reply-to`.
- No `l=` body-length tag.
- From domain: `succinct.xyz`; one From header.
- Subject, Date, and Message-ID are all included in `h=`.
- Candidate order-template merchant pattern: no match in Subject or body.
- No Zomato merchant template has been validated. Merchant-name presence cannot
  be established without a supported provider template; the negative pattern
  checks do not establish that no organization name exists in the message.

This was a structural audit, **not cryptographic signature verification**. The
Zomato configuration must retain a clearly marked **VERIFY AGAINST A REAL SAMPLE**
merchant pattern and use `Zomato order` as its fallback until a supported receipt
is available. Future committed tests must use generated synthetic data. The
existing non-Zomato sample must be rejected as unsupported rather than relabeled.

## Privacy checks

The initial `git ls-files` inventory contained no real email, private key file, or
`.env`. `.env.example` contained placeholders only. `samples/official-residency.eml`
is ignored, as confirmed with `git check-ignore`. The expanded exclusions also
cover `.env.local` and `.dkim-cache/keys.json`.

No feature-completeness, deployment, anonymity, or cryptographic-verification
claim follows from this inspection.
