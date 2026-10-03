# Architecture

```text
Private .eml in samples/ ─────── CLI ───────────────────┐
Pasted source / inbox ID ─ frontend on :3000            │
                            │ loopback JSON            │
                     127.0.0.1:3001 bridge ─────────────┤
                                                       ▼
                   SDK (local Node process on user's device)
  unchanged bytes / LF-only paste normalization → unique header parser
  → mailauth DKIM (DNS TXT keys ↔ ignored local cache)
  → signature-specific policy → signed Date freshness
  → provider template/fallback → merchantId + nullifier
  → validate review → precheck → simulate → estimate → one wallet send
                                                       │
                            public review calldata only│
                                                       ▼
         Base Sepolia ReceiptsReviews (no proof verification)
       used nullifiers + compact records + merchant count/rating sum
                     ReviewPosted event with full text
                                                       │
         paginated/adaptive log reader + view-backed merchant stats
                     → five-second cache → CLI / frontend
```

## Boundaries and determinism

- `email/` parses a separate view; the exact original buffer reaches mailauth.
  Strings are for pasted source and replace only bare LF with CRLF.
- `verify/` performs local cryptographic checks and signature-specific policy.
  Injected DNS/clock make synthetic tests deterministic and network-free.
- `config/providers.ts` contains allowlisted domains and template rules. No
  validated Zomato extraction pattern currently exists; fallback is explicit.
- `nullifier = keccak256(abi.encodePacked(lowercase(Message-ID), "|", lowercase(d)))`.
- `merchantId = keccak256(UTF8(lowercase(collapseSpaces(trim(merchantName)))))`.
- Demo mode uses `keccak256(abi.encodePacked(bytes32 nullifier, string salt))`.
- `chain/abi.ts` is generated from the Hardhat artifact. solc-js 0.8.24, optimizer
  200 and Paris target are pinned. Public deployment metadata includes ABI hash.
- The contract enforces input bounds and exact-nullifier replay, not receipt
  authenticity. State effects precede the event; there are no external interactions.
- Merchant names are not present in events. Known fallback names and an ignored
  local registry map hashes to names; unknown IDs show a short hash, never a guess.
- The reserved smoke merchant is filtered by default; SDK `includeSmoke: true`
  exposes it for release diagnostics. Statistics come from contract views.

## Persistence

Committed: code, synthetic fixture generators, lockfile and public deployment
metadata. Ignored: `.env`, original emails, `.dkim-cache/keys.json`, local deployment
metadata, merchant registry and generated compiler/build outputs. There is no
database, hosted email endpoint, LLM integration, moderation or privileged review role.
