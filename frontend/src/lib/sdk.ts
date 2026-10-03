// Browser transport for the existing bridge. Public SDK types/messages are the contract.
import type {
  ErrorCode,
  ReceiptsError as SdkError,
  VerifiedReceipt,
} from "@receipts-only/sdk";
import { errorCodes, errorMessages } from "virtual:receipts-sdk-contract";
import { z } from "zod";
import { env } from "./env";
export { errorCodes, errorMessages };
export type { ErrorCode };
export type ReceiptSource =
  { rawEmail: string; inboxId?: never } | { inboxId: string; rawEmail?: never };
// Errors cross HTTP as JSON. This browser-only envelope conforms to the public
// SDK error shape; it does not import Node verification/wallet modules.
export class ReceiptsError
  extends Error
  implements Pick<SdkError, "code" | "txHash" | "toJSON">
{
  constructor(
    public readonly code: ErrorCode,
    public readonly txHash?: `0x${string}`,
  ) {
    super(errorMessages[code]);
    this.name = "ReceiptsError";
  }
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.txHash ? { txHash: this.txHash } : {}),
    };
  }
}
const hex = z.string().regex(/^0x[0-9a-fA-F]{64}$/);
const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/);
const uint = z.string().regex(/^\d+$/);
const errorCode = z.custom<ErrorCode>(
  (value) => typeof value === "string" && Object.hasOwn(errorCodes, value),
);
const errorSchema = z.object({
  error: z.object({
    code: errorCode,
    message: z.string(),
    txHash: hex.optional(),
  }),
});
const explorer = z
  .string()
  .refine(
    (value) =>
      /^https:\/\/sepolia\.basescan\.org\/tx\/0x[0-9a-fA-F]{64}$/.test(value) ||
      /^local:0x[0-9a-fA-F]{64}$/.test(value),
  );
export const receiptSchema = z.object({
  merchantName: z.string(),
  orderDate: z.string().datetime(),
  nullifierPrefix: z.string().regex(/^0x[0-9a-fA-F]{1,14}$/),
  providerId: z.literal("zomato"),
});
export type ReceiptSummary = z.infer<typeof receiptSchema> &
  Pick<VerifiedReceipt, "merchantName" | "orderDate" | "providerId">;
export const merchantSchema = z.object({
  merchantId: hex,
  merchantName: z.string(),
  count: uint,
  average: z.number().min(0).max(5),
});
export type Merchant = z.infer<typeof merchantSchema>;
export const reviewSchema = z.object({
  reviewId: uint,
  merchantId: hex,
  merchantName: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string(),
  postedAt: uint,
  txHash: hex,
  blockNumber: uint,
  logIndex: z.number().int().nonnegative(),
  explorerUrl: explorer,
});
export type Review = z.infer<typeof reviewSchema>;
export const postSchema = receiptSchema.extend({
  reviewId: uint,
  txHash: hex,
  blockNumber: uint,
  explorerUrl: explorer,
  demo: z.boolean(),
});
export type Posted = z.infer<typeof postSchema>;
const healthSchema = z.object({
  ok: z.literal(true),
  stage: z.literal(1),
  envPresent: z.boolean(),
  chainId: z.literal(84532),
  deployer: address,
  balanceETH: z.string(),
  contractAddress: address,
  contractHasCode: z.literal(true),
  reviewCount: uint,
  dnsCachedKeys: z.number().int().nonnegative(),
});
const inboxSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().regex(/^[a-f0-9]{16}$/),
      sender: z.string(),
      subject: z.string(),
      date: z.string().datetime(),
    }),
  ),
});

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  options: { body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  try {
    const response = await fetch(`${env.bridge}${path}`, {
      method: options.body ? "POST" : "GET",
      headers: options.body
        ? { "Content-Type": "application/json" }
        : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      referrerPolicy: "no-referrer",
    });
    const value: unknown = await response.json();
    if (!response.ok) {
      const parsed = errorSchema.safeParse(value);
      throw parsed.success
        ? new ReceiptsError(
            parsed.data.error.code,
            parsed.data.error.txHash as `0x${string}` | undefined,
          )
        : new ReceiptsError("TX_FAILED");
    }
    const parsed = schema.safeParse(value);
    if (!parsed.success) throw new ReceiptsError("TX_FAILED");
    return parsed.data;
  } catch (error: unknown) {
    if (error instanceof ReceiptsError) throw error;
    if (options.signal?.aborted)
      throw new DOMException("Request cancelled", "AbortError");
    throw new ReceiptsError("TX_FAILED");
  }
}
export const sdk = {
  health: (signal?: AbortSignal) =>
    request("/health", healthSchema, { signal }),
  merchants: (signal?: AbortSignal) =>
    request("/merchants", z.object({ merchants: z.array(merchantSchema) }), {
      signal,
    }).then((r) => r.merchants),
  reviews: (merchantId?: string, signal?: AbortSignal) =>
    request(
      `/reviews${merchantId ? `?merchantId=${encodeURIComponent(merchantId)}` : ""}`,
      z.object({ reviews: z.array(reviewSchema) }),
      { signal },
    ).then((r) => r.reviews),
  inbox: (signal?: AbortSignal) =>
    request("/inbox", inboxSchema, { signal }).then((r) => r.items),
  verify: (source: ReceiptSource, signal?: AbortSignal) =>
    request("/verify", receiptSchema, { body: source, signal }),
  post: (source: ReceiptSource, rating: number, text: string, demo: boolean) =>
    request("/post", postSchema, { body: { ...source, rating, text, demo } }),
};
export const toError = (error: unknown) =>
  error instanceof ReceiptsError ? error : new ReceiptsError("TX_FAILED");
