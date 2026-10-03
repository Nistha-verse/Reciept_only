// Verify on this device and return only the allowed receipt summary.
import type { FastifyInstance } from "fastify";
import { summary } from "../../../cli/src/commands/verify.js";
import { verifySchema, source, type Services } from "../schemas.js";
export function verifyRoute(app: FastifyInstance, deps: Services) {
  app.post("/verify", async (request) => {
    const body = verifySchema.parse(request.body);
    return summary(await deps.verify(source(body, deps), deps.verifyOptions));
  });
}
