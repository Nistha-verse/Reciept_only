# Stage 1 security boundary — preliminary

This document records the intended Stage 1 trust boundary. The contract, SDK
verification pipeline, and localhost bridge are not implemented yet. The full
threat model and implementation review belong to Phase 7.

## Central limitation

**Stage 1: your device checks the receipt's signature**.

Authenticity will be checked off-chain by the SDK. The contract will not verify
any proof. **Anyone can call the contract directly with an arbitrary nullifier**,
bypassing all SDK email, sender, merchant, and freshness checks. Stage 1 therefore
cannot enforce receipt ownership against a caller who bypasses the application.

Reusing the same nullifier will be rejected by the intended contract, but an
attacker can choose another arbitrary nullifier. A mempool watcher can also
front-run a legitimate nullifier because Stage 1 does not bind it to the review
text, rating, merchant, or submitting account.

## Privacy boundary

**We never receive your email** describes the required local processing boundary.
The implementation must never send email contents to a remote service. Only a
development bridge bound to `127.0.0.1` may receive contents from a local browser.
The wallet key must remain in local `.env`; emails remain in ignored `samples/`.

DNS lookups disclose the DKIM selector and signing domain to the resolver, not
the email contents. Cached DNS keys will introduce freshness and key-rotation
tradeoffs that need documentation when implemented.

Review text, wallet addresses, and transaction timing will be public. Sharing a
demo wallet is not a guarantee of author privacy. The phrase "The public can't
tell who wrote this" must not be presented as an unqualified Stage 1 promise:
wallet funding, transaction activity, review text, and timing can identify or
link reviewers. Existing email providers such as Gmail already hold the emails
they deliver; local SDK processing does not change that.

No verifier, zero-knowledge property, or reviewer anonymity is implemented or
claimed. Receipt selling and restaurant self-ordering are not prevented by DKIM.
