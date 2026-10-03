# Security and explicit trust assumptions

## The central Stage 1 limitation

**Stage 1: your device checks the receipt's signature**. The SDK checks DKIM;
the contract does not verify any proof. **Anyone can call the contract directly
with an arbitrary nullifier**, bypassing every email and policy check. A fabricated
unique nullifier is accepted. This is an application-enforced gate, not
chain-enforced purchase verification.

## What the local verifier checks

Source size and unambiguous From/Subject/Date/Message-ID headers, DKIM presence,
actual signature/body-hash verification, provider alignment, strong algorithm/key,
signed header coverage, full-body coverage (reject `l=`), a signed Date within
90 days and not in the future, then configured merchant extraction and hashes.
No raw email is returned. Multiple signatures are evaluated independently: policy
is tied to the actual passing signature. DKIM canonicalization can legitimately
ignore some whitespace edits; rejection of every byte change is not promised.

Only `zomato.com` and its subdomains are allowed in config. The signing and From
domains must also be equal or in a parent/subdomain relationship. This deliberate
policy may reject legitimate third-party or sibling-domain signing until reviewed.

No real Zomato template is available. Extraction is disabled and the fallback is
`Zomato order`. DKIM authenticates provider mail, not the semantics of a purchase:
without a reviewed order template, other qualifying provider messages may pass.
Never describe synthetic tests as testing real Zomato purchase receipts. Notes,
names, addresses, and other customer-controlled body fields are not extracted.

## Threats and residual risks

- **Spoofing/tampering:** generated RSA fixtures demonstrate rejection of changed
  signed subject/body and unaligned domains. DNS resolver honesty and the provider's
  signing-key security remain trusted. DKIM does not prove who received a message.
- **Replay:** the contract prevents reuse of the same nonzero nullifier across
  all wallets. Lowercased Message-ID plus signing domain determines the SDK value.
  A Message-ID duplicated by a provider can cause a false collision. Direct
  callers can invent values; distinct signing domains or explicit demo salts can
  also produce distinct values. No anonymity property follows from this hash.
- **Nullifier front-running:** the nullifier is not bound to rating, text, merchant,
  or sender. A mempool watcher can consume it first, replace the review, and block
  the intended post. SDK prechecking and simulation do not eliminate this race.
- **Selling/sharing receipts:** possession of the email source is transferable.
  There is no human-identity or ownership check. Restaurant self-ordering is also
  possible, even with valid DKIM or a future proof.
- **DNS and key rotation:** online TXT keys are cached for 24 hours. Offline mode
  explicitly accepts saved keys regardless of age, so revoked keys may remain
  accepted locally. Deleting `.dkim-cache/keys.json` forces fresh online lookup.
  DNSSEC is not validated by this application; the OS resolver is trusted. A
  removed historical key can make a genuine old message unverifiable. This cache
  is not a timestamped historical-key registry.
- **Freshness:** the local clock and signed Date are trusted. Future timestamps
  fail with no tolerance. The provider may sign an incorrect date. The contract
  has no receipt freshness rule in Stage 1.
- **Wallet linkability:** the submitter address, funding trail, timing and review
  text are public. A shared demo wallet does not guarantee unlinkability. The
  requested phrase **"The public can't tell who wrote this"** must not be used as
  an unqualified claim: Stage 1 cannot guarantee that.
- **Permanent review text:** full text is in a public event, with a hash in state.
  There is no delete, edit, moderation, upgrade or administrator pathway. Warn
  reviewers not to include personal data before they submit.
- **DoS/gas:** the contract caps text at 1120 bytes, not 280 codepoints; SDK counts
  codepoints. Fixed-size state updates have no unbounded loops or external calls.
  Checked arithmetic reverts atomically; practical uint128 overflow is infeasible.
  Local email size is capped at 1 MB, headers at 64 KB and DKIM signatures at eight.
- **Uncertain transaction state:** sends are never automatically retried. A
  confirmation timeout returns TX_PENDING with the known hash. A transport failure
  during send may still mean broadcast occurred; inspect wallet history before
  manually retrying. Event reads use one-confirmation data and can be affected by
  reorgs; the five-second UI cache is not a finality indexer.

## Localhost bridge boundary

**We never receive your email**: no remote application server receives source.
The optional bridge runs on the user's own device and necessarily receives
browser-submitted source over loopback. It binds only `127.0.0.1`, refuses production,
rejects non-loopback peers, ignores forwarded IP headers, checks the Host header,
and permits only the two documented frontend origins. HTTP JSON schemas, 1 MB
limit, no request logging, and 10 post requests/minute limit are enforced.

CORS is not authentication against local software. A malicious local process or
compromised allowed frontend can use the throwaway wallet and read inbox metadata.
Do not expose it through a tunnel, reverse proxy or shared machine. Browser UI
must render subjects/review text with text nodes, never raw HTML. `.env` keys never
go to the frontend, but the local OS and process memory remain trusted.

Gmail or another email provider already holds emails it delivers. This project's
local-processing rule does not erase that existing custody. DNS requests disclose
selector/domain metadata; chain RPCs receive public transaction calldata. No LLM
or AI service is called by product code.

## Evidence limits

Hardhat, SDK synthetic signatures, local-chain integration, and HTTP injection
are tested independently. The bridge unit tests mock chain submission, while the
SDK/CLI integration uses a real local node. See PROGRESS for actual Base Sepolia
transactions, source verification status, command output and final review notes.
This is a hackathon implementation, not an external security audit.
