# Honest demo runbook

## Before judging

Run `npm run cli -- doctor --json`, then `npm run bridge`. Open the frontend from
one of the two allowed port-3000 origins. The frontend is not implemented here.
Never project `.env`, raw source files, or a terminal inbox with personal subjects.

Say **"Stage 1: your device checks the receipt's signature"** and **"We never
receive your email"**, explaining that the demo bridge runs on the same device.
Immediately disclose: **the contract trusts off-chain checks and can be called
directly with arbitrary nullifiers**. Do not claim anonymous reviewers. The phrase
"The public can't tell who wrote this" is not an accurate unqualified guarantee
because wallet, timing and content remain linkable.

## Click path / equivalent API path

1. **Fake reviewer bounced:** POST `/verify` with a synthetic unsigned email.
   Show NOT_SIGNED (or EMAIL_PARSE_FAILED for malformed source). No transaction.
2. **Valid source:** choose an inbox ID or paste full source locally. `/verify`
   shows only merchant/date/nullifier prefix. `/post` re-verifies and sends a real
   transaction, then displays its explorer link and reloads `/reviews`.
3. **Tampering:** modify one visible body character in an in-memory copy or an
   ignored/temp copy, never the original. `/verify` returns TAMPERED. Delete the
   temporary copy. DKIM canonicalization means whitespace-only edits may not fail.
4. **Receipt reuse:** POST the original source again without `demo`. ALREADY_USED
   appears; the on-chain count does not increase.
5. **Explicit demo reuse:** toggle a clearly labeled demo switch and send
   `demo: true`. Show the demo marker and explain that salting intentionally
   bypasses receipt reuse, creating another public review.

## Available evidence and sample limitation

The supplied local sample is not Zomato and cannot be a legitimate Zomato demo
receipt. No real Zomato template is validated. The merchant fallback is `Zomato
order`, and purchase semantics are not established by signature validity alone.

`npm run test:local` demonstrates the sequence with **synthetic RSA-signed email
and an injected synthetic DNS resolver**. If the release uses that fallback on
Base Sepolia, describe it as a real chain transaction with a synthetic receipt,
not as a real purchase. A test signature asserting `zomato.com` with an injected
key is not a signature from Zomato's published key.

`npm run cli -- demo-seed --json` verifies each original sample, posts only accepted
ones, varies ratings/text, and reports skip codes. Unsupported/old/used samples
are expected skips. It does not silently enable salted demo mode. With current
inputs it may post zero reviews.

## Presentation guardrails

- Review text is permanent public event data; use nonpersonal examples.
- The smoke-test merchant is hidden from normal lists but remains publicly visible
  on the chain. It is not evidence of a purchase or DKIM verification.
- A successful `/verify` can still be followed by front-running, RPC failure,
  insufficient funds or transaction uncertainty. Show stable errors honestly.
- For TX_PENDING, open its hash and wait. Never repeatedly click submit or replay
  the request automatically. For send-time transport errors, inspect wallet history.
