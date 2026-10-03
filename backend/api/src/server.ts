// Localhost-only development server. Request/body logging and proxy trust are disabled.
import Fastify from "fastify";
import { pathToFileURL } from "node:url";
import { loadEnv } from "../../sdk/src/config/env.js";
import { ReceiptsError } from "../../sdk/src/errors/ReceiptsError.js";
import { loopbackOnly, assertStartup } from "./middleware/loopbackOnly.js";
import { cors } from "./middleware/cors.js";
import { errors } from "./middleware/errors.js";
import { services, type Services } from "./schemas.js";
import { healthRoute } from "./routes/health.js";
import { inboxRoute } from "./routes/inbox.js";
import { verifyRoute } from "./routes/verify.js";
import { postRoute } from "./routes/post.js";
import { reviewsRoute } from "./routes/reviews.js";
import { merchantsRoute } from "./routes/merchants.js";
export function createApp(overrides: Partial<Services> = {}) {
  const app = Fastify({
    logger: false,
    trustProxy: false,
    bodyLimit: 1024 * 1024,
    requestTimeout: 180000,
  });
  const deps = { ...services, ...overrides };
  errors(app);
  app.addHook("onRequest", loopbackOnly);
  app.addHook("onRequest", cors);
  app.options("/*", async (_req, reply) => reply.code(204).send());
  for (const route of [
    healthRoute,
    inboxRoute,
    verifyRoute,
    postRoute,
    reviewsRoute,
    merchantsRoute,
  ])
    route(app, deps);
  return app;
}
export async function start() {
  const env = loadEnv();
  assertStartup(env.HOST ?? "127.0.0.1", env.NODE_ENV);
  assertStartup(process.env.HOST ?? "127.0.0.1", process.env.NODE_ENV);
  const port = Number(env.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new ReceiptsError("ENV_INVALID");
  const app = createApp({
    verifyOptions: { offline: env.DKIM_OFFLINE === "1" },
  });
  await app.listen({ host: "127.0.0.1", port });
  console.log(`Local development bridge: http://127.0.0.1:${port}`);
  console.log("Stage 1: your device checks the receipt's signature");
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  start().catch((error) => {
    console.error(
      error instanceof ReceiptsError
        ? `${error.code}: ${error.message}`
        : "BRIDGE_START_FAILED: check local configuration and port availability.",
    );
    process.exitCode = 1;
  });
