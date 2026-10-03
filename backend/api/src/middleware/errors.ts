// Stable safe HTTP errors; never serialize validation inputs or dependency causes.
import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { ReceiptsError } from "../../../sdk/src/errors/ReceiptsError.js";
import { decodeRevert } from "../../../sdk/src/errors/decodeRevert.js";
import type { ErrorCode } from "../../../sdk/src/errors/codes.js";
export const statuses: Partial<Record<ErrorCode, number>> = {
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  ALREADY_USED: 409,
  RATE_LIMITED: 429,
  BODY_TOO_LARGE: 413,
  ENV_INVALID: 503,
  DNS_UNAVAILABLE: 503,
  TX_FAILED: 502,
  TX_PENDING: 504,
  INVALID_INPUT: 400,
};
export function errors(app: FastifyInstance) {
  app.setErrorHandler((error: any, _request, reply) => {
    const safe =
      error instanceof ZodError ||
      [
        "FST_ERR_CTP_INVALID_JSON_BODY",
        "FST_ERR_CTP_INVALID_MEDIA_TYPE",
        "FST_ERR_CTP_EMPTY_JSON_BODY",
      ].includes(error?.code)
        ? new ReceiptsError("INVALID_INPUT")
        : error?.code === "FST_ERR_CTP_BODY_TOO_LARGE"
          ? new ReceiptsError("BODY_TOO_LARGE")
          : decodeRevert(error);
    reply.code(statuses[safe.code] ?? 422).send({ error: safe.toJSON() });
  });
  app.setNotFoundHandler((_request, reply) =>
    reply.code(404).send({ error: new ReceiptsError("NOT_FOUND").toJSON() }),
  );
}
