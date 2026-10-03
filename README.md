# Receipts Only

Receipt-based reviews for Base Sepolia, currently an unimplemented scaffold being migrated to Stage 1.

**Stage 1: your device checks the receipt's signature** is the intended SDK verification flow. The contract will trust off-chain verification and will not verify any proof. Direct contract calls can bypass the SDK. Review transactions are public and wallet-linkable.

**We never receive your email** describes the intended local processing boundary: email contents stay on your device, including when using the planned localhost-only development bridge. No verification flow has been implemented or tested yet.

## Status

Phase 0 inspection and obsolete scaffold cleanup are complete. The deployment environment check is blocked because `.env` is absent; no contract has been deployed. See [`docs/INSPECTION.md`](docs/INSPECTION.md) and [`docs/PROGRESS.md`](docs/PROGRESS.md) for the resume point.

## Folder map

- `backend/contracts/` — planned Hardhat Solidity project; obsolete placeholders removed.
- `backend/sdk/` — TypeScript SDK skeleton; local Node DKIM implementation pending.
- `backend/cli/` — Node-only local/testnet commands.
- `backend/scripts/` — repository maintenance scripts.
- `samples/` — private local `.eml` files; contents are ignored by git.
- `frontend/` — reserved for the later frontend handoff.
- `docs/` — inspection, security notes, historical zk-email notes, and progress.

## Quickstart

Install existing workspace dependencies with `npm install`. Create the local configuration without exposing credentials in shell history:

```sh
cp -n .env.example .env
chmod 600 .env
nano .env
```

Set `BASE_SEPOLIA_RPC_URL` to your Base Sepolia RPC endpoint and `DEPLOYER_PRIVATE_KEY` to a throwaway testnet wallet key. Foundry is not needed. CLI commands, the bridge, tests, and deployment scripts are not implemented yet.
