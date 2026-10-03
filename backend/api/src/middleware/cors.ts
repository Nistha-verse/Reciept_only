// CORS is a strict allowlist; reject other origins rather than merely omitting headers.
import type { FastifyRequest, FastifyReply } from "fastify";
import { ReceiptsError } from "../../../sdk/src/errors/ReceiptsError.js";
const origins = new Set(["http://localhost:3000", "http://127.0.0.1:3000"]);
export async function cors(request: FastifyRequest, reply: FastifyReply) {
  const origin = request.headers.origin;
  if (origin && !origins.has(origin)) throw new ReceiptsError("FORBIDDEN");
  if (origin)
    reply
      .header("Access-Control-Allow-Origin", origin)
      .header("Vary", "Origin");
  reply.header("Cache-Control", "no-store");
  if (request.method === "OPTIONS") {
    const headers = request.headers["access-control-request-headers"];
    if (
      headers &&
      String(headers)
        .toLowerCase()
        .split(",")
        .some((h) => h.trim() !== "content-type")
    )
      throw new ReceiptsError("FORBIDDEN");
    return reply
      .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
      .header("Access-Control-Allow-Headers", "Content-Type")
      .code(204)
      .send();
  }
}
