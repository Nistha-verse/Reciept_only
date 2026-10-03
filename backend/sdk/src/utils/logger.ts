// Allowlisted structured logging: arbitrary messages and unknown fields are never logged.
const allowed = new Set([
  "code",
  "address",
  "txHash",
  "chainId",
  "blockNumber",
  "count",
  "gasUsed",
]);
const forbidden = /raw|email|key|token|authorization|password|secret|rpc|url/i;
export function redact(fields: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(fields).map(([name, value]) => {
      if (forbidden.test(name) || !allowed.has(name))
        return [name, "[REDACTED]"];
      const safe = String(value);
      return [
        name,
        /@|bearer|private|https?:|\r|\n/i.test(safe) ? "[REDACTED]" : safe,
      ];
    }),
  );
}
export function log(
  event: "demo" | "transaction" | "error",
  fields: Record<string, unknown> = {},
) {
  const message = event === "demo" ? "DEMO MODE: nullifier salted" : event;
  console.error(JSON.stringify({ message, ...redact(fields) }));
}
