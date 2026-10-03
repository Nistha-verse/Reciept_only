// Merchant summary endpoint uses SDK on-chain counts and rating sums.
import type { FastifyInstance } from "fastify";
import { wire, type Services } from "../schemas.js";
export function merchantsRoute(app: FastifyInstance, deps: Services) {
  app.get("/merchants", async () =>
    wire({ merchants: await deps.merchants() }),
  );
}
