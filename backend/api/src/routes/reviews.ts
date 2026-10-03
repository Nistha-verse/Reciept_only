// Read public events; omit internal nullifier plumbing from the frontend response.
import type { FastifyInstance } from "fastify";
import type { Hex } from "viem";
import { reviewsSchema, wire, type Services } from "../schemas.js";
export function reviewsRoute(app: FastifyInstance, deps: Services) {
  app.get("/reviews", async (request) => {
    const { merchantId } = reviewsSchema.parse(request.query);
    const reviews = await deps.reviews({
      merchantId: merchantId?.toLowerCase() as Hex | undefined,
    });
    return wire({
      reviews: reviews.map(({ nullifier: _nullifier, ...review }) => review),
    });
  });
}
