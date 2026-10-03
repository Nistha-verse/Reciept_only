// Reject tracked secrets and email files; report paths only, never matched contents.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename } from "node:path";

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const forbidden = tracked.filter((file) => {
  const name = basename(file);
  return (
    (name.startsWith(".env") &&
      (name === ".env" || name.startsWith(".env.")) &&
      name !== ".env.example") ||
    /\.(?:pem|key|eml)$/i.test(file) ||
    (file.startsWith("samples/") && file !== "samples/.gitkeep")
  );
});

// Conservatively flag all literal 32-byte hex values: hashes must be derived in
// source or explicitly reviewed before narrowing this check in a later phase.
const secretPattern =
  /\b0x[0-9a-fA-F]{64}\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
const suspicious = tracked.filter((file) => {
  if (forbidden.includes(file)) return false;
  // Check both the index (what a commit would contain) and the working copy.
  const staged = execFileSync("git", ["show", `:${file}`], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
  return (
    secretPattern.test(staged) ||
    (existsSync(file) && secretPattern.test(readFileSync(file, "utf8")))
  );
});

if (forbidden.length || suspicious.length) {
  console.error("Secret tracking check failed. Review these paths only:", [
    ...new Set([...forbidden, ...suspicious]),
  ]);
  process.exit(1);
}

console.log(
  `Secret tracking check passed: ${tracked.length} tracked paths; no email files, environment secrets, or private-key patterns.`,
);
