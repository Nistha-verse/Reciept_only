// Request validation, dependency seams and JSON-safe result conversion.
import { z } from "zod";
import {
  verifyReceipt,
  postReview,
  getReviews,
  getMerchantSummary,
} from "../../sdk/src/index.js";
import { inbox, inboxSource } from "../../cli/src/commands/inbox.js";
import { doctor } from "../../cli/src/commands/doctor.js";
import type { VerifyOptions } from "../../sdk/src/types/email.js";
export const sourceFields = {
  rawEmail: z
    .string()
    .min(1)
    .max(1024 * 1024)
    .optional(),
  inboxId: z
    .string()
    .regex(/^[0-9a-f]{16}$/)
    .optional(),
};
const oneSource = (v: { rawEmail?: string; inboxId?: string }) =>
  (v.rawEmail !== undefined) !== (v.inboxId !== undefined);
export const verifySchema = z.object(sourceFields).strict().refine(oneSource);
export const postSchema = z
  .object({
    ...sourceFields,
    rating: z.number().int().min(1).max(5),
    text: z.string().min(1).max(1120),
    demo: z.boolean().optional(),
  })
  .strict()
  .refine(oneSource);
export const reviewsSchema = z
  .object({
    merchantId: z
      .string()
      .regex(/^0x[0-9a-fA-F]{64}$/)
      .optional(),
  })
  .strict();
export const wire = (value: unknown): any =>
  JSON.parse(
    JSON.stringify(value, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
  );
export interface Services {
  verify: typeof verifyReceipt;
  post: typeof postReview;
  reviews: typeof getReviews;
  merchants: typeof getMerchantSummary;
  inbox: typeof inbox;
  source: typeof inboxSource;
  health: typeof doctor;
  verifyOptions: VerifyOptions;
}
export const services: Services = {
  verify: verifyReceipt,
  post: postReview,
  reviews: getReviews,
  merchants: getMerchantSummary,
  inbox,
  source: inboxSource,
  health: doctor,
  verifyOptions: {},
};
export const source = (
  body: { rawEmail?: string; inboxId?: string },
  deps: Services,
) => body.rawEmail ?? deps.source(body.inboxId!);
