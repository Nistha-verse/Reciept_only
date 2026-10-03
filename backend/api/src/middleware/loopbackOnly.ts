// Enforce real socket origin, local Host headers and safe development startup.
import type { FastifyRequest } from "fastify";
import { ReceiptsError } from "../../../sdk/src/errors/ReceiptsError.js";
export function assertStartup(host: string, mode?: string) {
  if (host !== "127.0.0.1" || mode === "production")
    throw new ReceiptsError("FORBIDDEN");
}
export async function loopbackOnly(request: FastifyRequest) {
  if (
    !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(request.ip) ||
    !/^(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(request.headers.host ?? "")
  )
    throw new ReceiptsError("FORBIDDEN");
}
