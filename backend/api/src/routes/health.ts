// Public diagnostics for the local frontend, without credentials.
import type { FastifyInstance } from "fastify";
import { wire, type Services } from "../schemas.js";
export function healthRoute(app: FastifyInstance, deps: Services) {
  app.get("/health", async () =>
    wire({ ok: true, stage: 1, ...(await deps.health()) }),
  );
}
