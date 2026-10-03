# Frontend API and SDK

The browser uses `http://127.0.0.1:3001`. Run `npm run bridge`. Approved browser
origins are exactly `http://localhost:3000` and `http://127.0.0.1:3000`. POST JSON
with `Content-Type: application/json`; credentials/cookies are not used. All
responses set `Cache-Control: no-store`. JSON bigint quantities are decimal strings.

## Bridge endpoints

### GET /health

No body. Validates RPC chain and deployed code. Example response:

```json
{
  "ok": true,
  "stage": 1,
  "envPresent": true,
  "chainId": 84532,
  "deployer": "0x…",
  "balanceETH": "0.0001",
  "contractAddress": "0x…",
  "contractHasCode": true,
  "reviewCount": "2",
  "dnsCachedKeys": 1
}
```

### GET /inbox

No body. Local regular `.eml` files only; symlinks are excluded. Sender is a domain,
not a mailbox. Metadata is unverified and must be displayed as text.

```json
{
  "items": [
    {
      "id": "1234567890abcdef",
      "sender": "zomato.com",
      "subject": "Order confirmation",
      "date": "2026-10-03T08:00:00.000Z"
    }
  ]
}
```

### POST /verify

Exactly one source: `{ "rawEmail": "<complete pasted source>" }` **or**
`{ "inboxId": "1234567890abcdef" }`. Extra fields are rejected.

```json
{
  "merchantName": "Zomato order",
  "orderDate": "2026-10-03T08:00:00.000Z",
  "nullifierPrefix": "0x…",
  "providerId": "zomato"
}
```

### POST /post

Exactly one source plus integer `rating`, `text`, optional boolean `demo`:

```json
{
  "inboxId": "1234567890abcdef",
  "rating": 5,
  "text": "Food arrived warm.",
  "demo": false
}
```

The server verifies again inside this request; a preceding `/verify` is not an
authorization token. No wallet key, merchantId or nullifier is accepted from UI.

```json
{
  "merchantName": "Zomato order",
  "orderDate": "2026-10-03T08:00:00.000Z",
  "nullifierPrefix": "0x…",
  "providerId": "zomato",
  "reviewId": "2",
  "txHash": "0x…",
  "blockNumber": "12345",
  "explorerUrl": "https://sepolia.basescan.org/tx/0x…",
  "demo": false
}
```

`demo: true` creates a fresh random salt on every request and logs the explicit
demo marker. Disable the submit button while pending. Never automatically replay
`/post` after a timeout; inspect transaction/wallet state first. Ten requests per
minute are allowed, including invalid post requests. JSON body limit is 1 MB.

### GET /reviews?merchantId=0x…

Optional full bytes32 merchant ID; other query fields fail validation. Newest
first, reserved smoke merchant hidden, no raw email or nullifier in bridge output.

```json
{
  "reviews": [
    {
      "reviewId": "2",
      "merchantId": "0x…",
      "merchantName": "Zomato order",
      "rating": 5,
      "text": "Food arrived warm.",
      "postedAt": "1791014400",
      "txHash": "0x…",
      "blockNumber": "12345",
      "logIndex": 0,
      "explorerUrl": "https://sepolia.basescan.org/tx/0x…"
    }
  ]
}
```

### GET /merchants

```json
{
  "merchants": [
    {
      "merchantId": "0x…",
      "merchantName": "Zomato order",
      "count": "1",
      "average": 5
    }
  ]
}
```

The ellipses in these examples are illustrative, not valid addresses or hashes.

## Errors and UI messages

Shape: `{ "error": { "code": "ALREADY_USED", "message": "This receipt has already been used." } }`.
TX_PENDING may additionally include `error.txHash`. Client code should switch on
`code`, not parse message strings. Exact runtime messages are in
`backend/sdk/src/errors/messages.ts`.

| Code               | HTTP | UI message                                                                          |
| ------------------ | ---- | ----------------------------------------------------------------------------------- |
| EMAIL_PARSE_FAILED | 422  | The email source is malformed or has ambiguous headers.                             |
| NOT_SIGNED         | 422  | No usable DKIM signature or published DKIM key was found.                           |
| TAMPERED           | 422  | The receipt signature or body hash does not match. Use the original email source.   |
| UNSUPPORTED_SENDER | 422  | Only aligned Zomato signing and sender domains are supported.                       |
| DKIM_POLICY_FAILED | 422  | The signature does not meet the signed-header, full-body, or strong-key policy.     |
| TOO_OLD            | 422  | The receipt is more than 90 days old.                                               |
| EMAIL_IN_FUTURE    | 422  | The receipt date is in the future.                                                  |
| DNS_UNAVAILABLE    | 503  | The DKIM key lookup failed or is not available in the offline cache.                |
| ALREADY_USED       | 409  | This receipt has already been used.                                                 |
| INVALID_RATING     | 422  | Choose a whole-number rating from 1 to 5.                                           |
| REVIEW_EMPTY       | 422  | Write a review before posting.                                                      |
| REVIEW_TOO_LONG    | 422  | Keep the review within 280 Unicode code points.                                     |
| TX_FAILED          | 502  | The chain request failed. Check the network and wallet balance.                     |
| TX_PENDING         | 504  | Transaction confirmation is unknown. Check the transaction before trying again.     |
| ENV_INVALID        | 503  | Local configuration is missing or invalid. Check .env without sharing its contents. |
| INVALID_INPUT      | 400  | The request contains invalid fields.                                                |
| NOT_FOUND          | 404  | The requested local item was not found.                                             |
| FORBIDDEN          | 403  | This development bridge only accepts approved local requests.                       |
| RATE_LIMITED       | 429  | Too many posts. Wait one minute and try again.                                      |
| BODY_TOO_LARGE     | 413  | The request exceeds the 1 MB limit.                                                 |

Malformed bridge rating/types fail schema validation as INVALID_INPUT before
the SDK-specific rating/text checks. Text beyond the bridge's 1120-unit structural
cap also fails the schema; Unicode codepoint checks happen in the SDK.

## Node SDK: exact public function signatures

```ts
declare function verifyReceipt(
  rawEmail: string | Uint8Array,
  opts?: VerifyOptions,
): Promise<VerifiedReceipt>;
declare function postReview(
  receipt: VerifiedReceipt,
  rating: number,
  text: string,
  opts?: PostOptions,
): Promise<PostedReview>;
declare function getReviews(opts?: ReadOptions): Promise<Review[]>;
declare function getMerchantSummary(
  opts?: ChainOptions,
): Promise<MerchantSummary[]>;
```

```ts
type DnsResolver = (name: string, type: string) => Promise<string[][]>;
interface VerifyOptions {
  resolver?: DnsResolver;
  now?: () => Date;
  offline?: boolean;
  dnsCachePath?: string;
}
interface VerifiedReceipt {
  merchantId: Hex;
  merchantName: string;
  nullifier: Hex;
  orderDate: string;
  providerId: string;
}
interface ChainContext {
  publicClient: PublicClient;
  walletClient?: WalletClient;
  address: Address;
  deploymentBlock: bigint;
  chainId: number;
}
interface ChainOptions {
  context?: ChainContext;
}
interface PostOptions extends ChainOptions {
  demoSalt?: string;
  timeoutMs?: number;
}
interface ReadOptions extends ChainOptions {
  merchantId?: Hex;
  fromBlock?: bigint;
  includeSmoke?: boolean;
  noCache?: boolean;
}
interface PostedReview {
  reviewId: bigint;
  txHash: Hex;
  blockNumber: bigint;
  explorerUrl: string;
}
interface Review extends PostedReview {
  merchantId: Hex;
  merchantName: string;
  nullifier: Hex;
  rating: number;
  text: string;
  postedAt: bigint;
  logIndex: number;
}
interface MerchantSummary {
  merchantId: Hex;
  merchantName: string;
  count: bigint;
  average: number;
}
```

`Hex`, `Address`, `PublicClient`, `WalletClient` are viem types. Runtime exports
are only the four functions, `ReceiptsError`, and `ERROR_CODES`; the listed types
and `ErrorCode` are type exports. The package builds with `npm run build -w
@receipts-only/sdk`. It is intentionally Node-local in Stage 1. Injected resolvers
are a trusted SDK/test seam, never a browser-controlled bridge parameter.

## Environment

Secrets come only from ignored root `.env`: required `BASE_SEPOLIA_RPC_URL`,
`DEPLOYER_PRIVATE_KEY`; optional `BASESCAN_API_KEY`. Nonsecret bridge settings:
`HOST=127.0.0.1`, `PORT=3001`, `NODE_ENV=development`, `DKIM_OFFLINE=1` for offline
cache mode. Process `HOST`/`NODE_ENV` cannot override unsafe values: either source
requesting non-loopback/production is refused. `RECEIPTS_LOCAL=1` selects only the
local chain; it never substitutes a key. CLI `--offline` overrides its DNS mode.
