# Receipts Only — Stage 1

**Stage 1: your device checks the receipt's signature**.

Local DKIM verification, a TypeScript SDK/CLI, a localhost development bridge,
and a small Base Sepolia review contract. **We never receive your email**: raw
source is processed locally; only public review data goes to the chain. DNS
queries send the DKIM selector/domain, not the email.

**The contract does not verify any proof. Anyone can bypass the SDK and post
using an arbitrary nullifier. Transactions are public and wallet-linkable.**
This is not an anonymity or zero-knowledge implementation. See
[SECURITY](docs/SECURITY.md) before presenting the demo.

## Quickstart

Deployed Base Sepolia contract (source verified on Basescan):
[0xd5590616ba215de3c973d8cbc31ec4f35cc1f4d9](https://sepolia.basescan.org/address/0xd5590616ba215de3c973d8cbc31ec4f35cc1f4d9).
See [PROGRESS](docs/PROGRESS.md) for deployment, smoke and synthetic-receipt transactions.

Use Node 22+ (tested with 24.10.0), npm, and a throwaway Base Sepolia wallet.
Foundry, a browser prover, and a remote email service are not required.

```sh
npm ci
cp -n .env.example .env
chmod 600 .env
nano .env
npm run compile
npm run typecheck
npm run test:contracts
npm run test:sdk
npm run test:api
npm run test:local
```

Set `BASE_SEPOLIA_RPC_URL` and `DEPLOYER_PRIVATE_KEY` in `.env` only. A bare
64-hex-character private key is accepted and prefixed in memory; the file is not
modified. Do not paste credentials into chat or shell arguments.

Place original Zomato `.eml` files only in ignored `samples/`. File bytes are
never normalized; pasted text alone permits bare-LF to CRLF normalization.

```sh
npm run cli -- doctor --json
npm run cli -- verify samples/receipt.eml --json
npm run cli -- post samples/receipt.eml 5 "Food arrived warm." --json
npm run cli -- read --merchant "Zomato order" --json
npm run cli -- merchants --json
npm run cli -- inbox --json
npm run cli -- demo-seed --json
npm run bridge
```

Bridge URL: `http://127.0.0.1:3001`. Only frontend origins
`http://localhost:3000` and `http://127.0.0.1:3000` are allowed. It refuses
production mode and any bind host other than `127.0.0.1`.

`verify`/`post`/`demo-seed --offline` use locally cached DKIM keys. `post --demo`
generates a new salt and emits **DEMO MODE: nullifier salted** to stderr. It is
explicit replay bypass for demonstration, not a receipt-ownership guarantee.

## Local development

`npm run test:local` starts a private local node, funds the `.env` address inside
that node, deploys, runs eight synthetic signed-email CLI outcomes, and stops the
node. It never prints the development node's private keys. No testnet transaction
is sent by this command. Other CLI commands accept `--local` for a separately
running local node with an ignored `backend/.local-deployment.json`.

```sh
npm run deploy -- --dry-run
npm run deploy
npm run sanity
npm run sync-abi
```

Run deployment once and inspect a printed transaction before retrying any failed
deployment. Public metadata is stored in `backend/deployments.json`; local-node
metadata is separate and ignored. Release results are in [PROGRESS](docs/PROGRESS.md).

## DEPLOYED CONTRACT ADDRESS
Deployed Base Sepolia contract (source verified on Basescan):
[0xd5590616ba215de3c973d8cbc31ec4f35cc1f4d9](https://sepolia.basescan.org/address/0xd5590616ba215de3c973d8cbc31ec4f35cc1f4d9).

## What is real versus Stage 2

- **Implemented and locally tested:** Solidity validation/replay state/events;
  RSA DKIM verification, strict signature policy and freshness; synthetic
  adversarial tests; local transaction simulation/post/read; safe bridge guards.
- **Real Zomato receipt/template:** not validated. The only supplied sample is
  an unrelated residency email. Merchant fallback is **Zomato order**. All
  qualifying provider mail shares that merchant until a fixed template is reviewed;
  order-confirmation semantics are not established by DKIM alone.
- **Chain-enforced authenticity, review-bound proofs, DKIM-key registry:** Stage 2.
- **Anonymity, tokens, moderation, review administration, upgradeability:** absent.

## Folder map and frontend handoff

- `backend/contracts/`: Hardhat Solidity, contract/gas tests, release scripts.
- `backend/sdk/src/`: config, types, errors, email, verify, chain, reviews, utils.
- `backend/sdk/tests/`: generated synthetic fixtures, adversarial/unit/local tests.
- `backend/cli/`: local commands; `backend/api/`: localhost bridge and HTTP tests.
- `backend/scripts/`: ABI synchronization, secret check, local CLI flow.
- `samples/`: ignored private input; `frontend/`: untouched by this implementation.
- [API](docs/API.md), [ARCHITECTURE](docs/ARCHITECTURE.md),
  [DEMO](docs/DEMO.md), [STAGE2](docs/STAGE2.md), [INSPECTION](docs/INSPECTION.md).

The SDK is Node-local in Stage 1. The frontend should use the bridge, never
bundle the wallet, DNS verifier, filesystem helpers, or `.env` into a browser.
