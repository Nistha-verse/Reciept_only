# Progress

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
