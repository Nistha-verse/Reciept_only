// HTTP-level injection tests with real synthetic DKIM and mocked chain submission.
import { it, expect, vi } from "vitest";
import { createApp } from "../src/server.js";
import { assertStartup } from "../src/middleware/loopbackOnly.js";
import { synthetic, NOW } from "../../sdk/tests/fixtures/synthetic.js";
import { hashText } from "../../sdk/src/utils/hash.js";
import { ReceiptsError } from "../../sdk/src/errors/ReceiptsError.js";
const origin = { origin: "http://localhost:3000", host: "127.0.0.1:3001" };
it("refuses non-loopback and production startup", () => {
  for (const host of ["0.0.0.0", "localhost", "192.168.1.2"])
    expect(() => assertStartup(host)).toThrow();
  expect(() => assertStartup("127.0.0.1", "production")).toThrow();
  expect(() => assertStartup("127.0.0.1", "development")).not.toThrow();
});
it("rejects non-loopback sockets, foreign origins and DNS-rebinding hosts", async () => {
  const app = createApp();
  try {
    for (const options of [
      { remoteAddress: "203.0.113.1", headers: origin },
      { headers: { ...origin, origin: "https://evil.invalid" } },
      { headers: { ...origin, host: "evil.invalid" } },
    ]) {
      const r = await app.inject({ method: "GET", url: "/inbox", ...options });
      expect(r.statusCode).toBe(403);
      expect(r.json().error.code).toBe("FORBIDDEN");
    }
  } finally {
    await app.close();
  }
});
it("returns allowed CORS preflight and rejects unwanted headers", async () => {
  const app = createApp();
  try {
    const r = await app.inject({
      method: "OPTIONS",
      url: "/post",
      headers: { ...origin, "access-control-request-headers": "content-type" },
    });
    expect(r.statusCode).toBe(204);
    expect(r.headers["access-control-allow-origin"]).toBe(origin.origin);
    expect(
      (
        await app.inject({
          method: "OPTIONS",
          url: "/post",
          headers: {
            ...origin,
            "access-control-request-headers": "authorization",
          },
        })
      ).statusCode,
    ).toBe(403);
  } finally {
    await app.close();
  }
});
it("verifies raw/source-ID input, posts after verification, and hides nullifier/key/raw fields", async () => {
  const f = await synthetic();
  const post = vi
    .fn()
    .mockResolvedValue({
      reviewId: 1n,
      txHash: hashText("test transaction"),
      blockNumber: 5n,
      explorerUrl: "local:test",
    });
  const app = createApp({
    verifyOptions: { resolver: f.resolver, now: () => NOW },
    source: () => f.raw,
    post,
  });
  try {
    for (const payload of [
      { rawEmail: f.raw.toString() },
      { inboxId: "1234567890abcdef" },
    ]) {
      const r = await app.inject({
        method: "POST",
        url: "/verify",
        headers: origin,
        payload,
      });
      expect(r.statusCode).toBe(200);
      expect(r.json().merchantName).toBe("Zomato order");
      expect(r.json().nullifier).toBeUndefined();
    }
    const r = await app.inject({
      method: "POST",
      url: "/post",
      headers: origin,
      payload: {
        rawEmail: f.raw.toString(),
        rating: 4,
        text: "Good",
        demo: true,
      },
    });
    expect(r.statusCode).toBe(200);
    expect(r.json().reviewId).toBe("1");
    expect(r.json().rawEmail).toBeUndefined();
    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][3].demoSalt).toBeTruthy();
    const bad = await app.inject({
      method: "POST",
      url: "/post",
      headers: origin,
      payload: {
        rawEmail: f.raw
          .toString()
          .replace("Synthetic order receipt.", "Synthetic order receipX."),
        rating: 4,
        text: "x",
      },
    });
    expect(bad.statusCode).toBe(422);
    expect(bad.json().error.code).toBe("TAMPERED");
    expect(post).toHaveBeenCalledTimes(1);
  } finally {
    await app.close();
  }
});
it("validates sources, fields, media type, query and body size without echoing input", async () => {
  const app = createApp();
  try {
    for (const payload of [
      {},
      { rawEmail: "private", inboxId: "1234567890abcdef" },
      { rawEmail: "private", token: "secret" },
    ]) {
      const r = await app.inject({
        method: "POST",
        url: "/verify",
        headers: origin,
        payload,
      });
      expect(r.statusCode).toBe(400);
      expect(r.body).not.toContain("private");
    }
    expect(
      (
        await app.inject({
          method: "GET",
          url: "/reviews?merchantId=bad",
          headers: origin,
        })
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/verify",
          headers: { ...origin, "content-type": "application/json" },
          payload: "{",
        })
      ).statusCode,
    ).toBe(400);
    const huge = await app.inject({
      method: "POST",
      url: "/verify",
      headers: origin,
      payload: { rawEmail: "a".repeat(1024 * 1024 + 1) },
    });
    expect(huge.statusCode).toBe(413);
  } finally {
    await app.close();
  }
});
it("rate limits the eleventh post, even if earlier inputs fail", async () => {
  const app = createApp();
  try {
    for (let i = 0; i < 11; i++) {
      const r = await app.inject({
        method: "POST",
        url: "/post",
        headers: origin,
        payload: {},
      });
      expect(r.statusCode).toBe(i === 10 ? 429 : 400);
    }
  } finally {
    await app.close();
  }
});
it("maps replay and not-found failures to stable statuses", async () => {
  const f = await synthetic();
  const app = createApp({
    verifyOptions: { resolver: f.resolver, now: () => NOW },
    post: async () => {
      throw new ReceiptsError("ALREADY_USED");
    },
  });
  try {
    const r = await app.inject({
      method: "POST",
      url: "/post",
      headers: origin,
      payload: { rawEmail: f.raw.toString(), rating: 5, text: "x" },
    });
    expect(r.statusCode).toBe(409);
    expect(r.json().error.code).toBe("ALREADY_USED");
    expect(
      (await app.inject({ method: "GET", url: "/missing", headers: origin }))
        .statusCode,
    ).toBe(404);
  } finally {
    await app.close();
  }
});
it("serves health, inbox and merchant/review response shapes without chain secrets", async () => {
  const app = createApp({
    health: async () => ({
      envPresent: true,
      chainId: 84532,
      deployer: "0xpublic",
      balanceETH: "1",
      contractAddress: "0xpublic",
      contractHasCode: true,
      reviewCount: 0n,
      dnsCachedKeys: 0,
    }),
    inbox: () => [],
    reviews: async () => [],
    merchants: async () => [],
  });
  try {
    for (const url of ["/health", "/inbox", "/reviews", "/merchants"]) {
      const r = await app.inject({ method: "GET", url, headers: origin });
      expect(r.statusCode).toBe(200);
      expect(r.headers["cache-control"]).toBe("no-store");
    }
  } finally {
    await app.close();
  }
});
