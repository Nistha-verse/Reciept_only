// Only public SDK error metadata is read at build time. Node verification stays out of the browser.
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { ERROR_CODES, ReceiptsError } from "@receipts-only/sdk";
import deployment from "../backend/deployments.json";

function sdkContract(): Plugin {
  const virtual = "virtual:receipts-sdk-contract";
  const security = readFileSync(
    new URL("../docs/SECURITY.md", import.meta.url),
    "utf8",
  );
  return {
    name: "receipts-public-sdk-contract",
    configureServer(server) {
      server.middlewares.use("/security.txt", (_req, res) => {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end(security);
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "security.txt",
        source: security,
      });
    },
    resolveId(id) {
      return id === virtual ? `\0${virtual}` : undefined;
    },
    load(id) {
      if (id !== `\0${virtual}`) return;
      const messages = Object.fromEntries(
        Object.values(ERROR_CODES).map((code) => [
          code,
          new ReceiptsError(code).message,
        ]),
      );
      return `export const errorCodes = ${JSON.stringify(ERROR_CODES)};\nexport const errorMessages = ${JSON.stringify(messages)};\nexport const deployment = ${JSON.stringify(deployment["84532"])};`;
    },
  };
}
export default defineConfig(({ mode }) => {
  const env = loadEnv(
    mode,
    fileURLToPath(new URL(".", import.meta.url)),
    "VITE_",
  );
  if (mode === "production" && env.VITE_TEST_MOCKS === "true")
    throw new Error("Test mocks cannot be enabled in a production build.");
  return {
    plugins: [react(), tailwindcss(), sdkContract()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    server: { host: "127.0.0.1", port: 3000, strictPort: true },
    build: { target: "es2022", sourcemap: false },
    test: {
      environment: "jsdom",
      setupFiles: ["./test/setup.ts"],
      include: ["test/unit/**/*.test.{ts,tsx}"],
      restoreMocks: true,
    },
  };
});
