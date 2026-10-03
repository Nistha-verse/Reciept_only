// Return explicit local inbox metadata only; no filename or raw source.
import type { FastifyInstance } from "fastify";
import type { Services } from "../schemas.js";
export function inboxRoute(app: FastifyInstance, deps: Services) {
  app.get("/inbox", async () => ({ items: deps.inbox() }));
}
