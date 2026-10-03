# Stage 2 migration design — not implemented

Stage 1 deployments are immutable and have no proxy. Stage 2 requires a **new
deployment** and a separately audited verifier/circuit, not an admin switch.

## Concrete file changes

1. Add a version-pinned receipt circuit and reproducible build/proving-key hashes.
   Prove DKIM RSA/Ed25519 validity, whole-body coverage, required signed headers,
   provider/from alignment, unique Message-ID parsing, receipt-template parsing,
   signed Date and deterministic merchant/nullifier derivation. Proving stays local.
2. Add generated `backend/contracts/contracts/ReceiptVerifier.sol` and a reviewed
   `DKIMKeyRegistry.sol`. The latter maps domain/key hashes to explicit validity
   intervals and revocation state. Choose and disclose a DNS attestation/governance
   trust model; a user-supplied TXT key is not sufficient evidence of provider origin.
3. Replace `ReceiptsReviews.sol` entry point with a proof-carrying post, immutable
   verifier/registry addresses, signal range checks and review binding. Remove
   the arbitrary-nullifier entry point entirely. Preserve review storage/event API.
4. Add `backend/sdk/src/proof/{proveReceipt,signals,reviewBinding}.ts`; keep
   `verify/verifyReceipt.ts` as fast local preflight, not an authorization decision.
   Change `chain/simulate.ts` and `chain/postReview.ts` to supply proof/signals.
5. Generate `chain/abi.ts` again, write new public deployment metadata, update
   bridge `schemas.ts`/`routes/post.ts`, CLI post flow and reader's deployment start.
   Demo salts must not be accepted by the production proof/contract path.
6. Add circuit/adversarial Solidity/SDK vectors for all policy attacks, mismatched
   review binding, cross-chain/address replay, expired registry keys and malformed
   field encodings. Do not reuse historical guessed zk-email signal indices.

## Proposed v1 public signal layout

This is a design specification, **not an existing circuit ABI**. Fix and test it
against the compiled circuit before generating a verifier. All 256-bit digests
are split into two 128-bit limbs (high then low), avoiding field-modulus truncation.

| Index | Signal                                   |
| ----- | ---------------------------------------- |
| 0     | protocol version = 1                     |
| 1     | chain ID                                 |
| 2     | target review contract address (160-bit) |
| 3     | authorized submitter address (160-bit)   |
| 4–5   | normalized merchant ID limbs             |
| 6–7   | deterministic receipt nullifier limbs    |
| 8–9   | DKIM public-key hash limbs               |
| 10    | signed order Date as Unix seconds        |
| 11    | proof expiry as Unix seconds             |
| 12–13 | review binding digest limbs              |
| 14    | provider identifier                      |
| 15    | parser/policy version                    |
| 16–17 | signing-domain hash limbs                |

The circuit and Solidity must agree on:

```text
reviewBinding = keccak256(abi.encode(
  protocolVersion, chainId, reviewContract, authorizedSubmitter,
  merchantId, nullifier, rating, keccak256(UTF8(reviewText)), proofExpiry
))
```

The contract checks current chain/address, `msg.sender`, exact calldata binding,
registry key/domain validity, timestamp/expiry rules, limb ranges, proof validity
and unused nullifier before state changes. Binding to the submitter prevents a
mempool watcher from stealing a proof; binding text/rating/merchant prevents
substitution. Smart-account/relayer support requires an explicitly authenticated
submitter design rather than simply dropping that constraint.

Private witnesses include the original signed email, signature, relevant decoded
provider template fields and DKIM public key. Public signals must not contain raw
Message-ID, buyer name, address, order items or source email. Merchant/date leakage,
wallet linkage, receipt selling and self-ordering remain separate concerns; proofs
alone do not make reviewers anonymous or economically independent.
