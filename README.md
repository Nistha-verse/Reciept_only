# Receipts Only

Anonymous, receipt-gated reviews for Base Sepolia. Email parsing and zk-email proving are client-side; this repository contains contracts, the TypeScript SDK, and a Node CLI. There is no backend web server.

## Status

The repository scaffold is being built phase by phase. See [`docs/PROGRESS.md`](docs/PROGRESS.md).

## Folder map

- `backend/contracts/` — Foundry Solidity contracts and tests.
- `backend/sdk/` — browser-safe TypeScript SDK.
- `backend/cli/` — Node-only local/testnet commands.
- `backend/scripts/` — repository maintenance scripts.
- `samples/` — private local `.eml` files; contents are ignored by git.
- `frontend/` — reserved for the later frontend handoff.
- `docs/` — architecture, security, zk-email notes, and progress.

## Quickstart

Install Node dependencies with `npm install`. Copy `.env.example` to `.env` and fill only local/testnet values.
