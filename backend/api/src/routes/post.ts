// Verify and post in one local request; callers never provide nullifiers or wallet keys.
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { summary } from "../../../cli/src/commands/verify.js";
import { postSchema, source, wire, type Services } from "../schemas.js";
import { ReceiptsError } from "../../../sdk/src/errors/ReceiptsError.js";
export function postRoute(app: FastifyInstance, deps: Services) {
  const windows = new Map<string, { since: number; count: number }>();
  app.post(
    "/post",
    {
      onRequest: async (request) => {
        const now = Date.now();
        let current = windows.get(request.ip);
        if (!current || now - current.since >= 60000) {
          current = { since: now, count: 0 };
          windows.set(request.ip, current);
        }
        if (++current.count > 10) throw new ReceiptsError("RATE_LIMITED");
      },
    },
    async (request) => {
      const body = postSchema.parse(request.body);
      const receipt = await deps.verify(source(body, deps), deps.verifyOptions);
      const result = await deps.post(receipt, body.rating, body.text, {
        demoSalt: body.demo ? randomUUID() : undefined,
      });
      return wire({ ...summary(receipt), ...result, demo: !!body.demo });
    },
  );
}
