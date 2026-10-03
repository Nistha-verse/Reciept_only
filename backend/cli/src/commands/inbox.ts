// Local sample inventory; opaque IDs cannot escape samples or follow symlinks.
import { readdirSync, lstatSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../../../sdk/src/config/env.js";
import { hashText } from "../../../sdk/src/utils/hash.js";
import { parseEml } from "../../../sdk/src/email/parseEml.js";
import { extractMetadata } from "../../../sdk/src/email/extractMetadata.js";
import { ReceiptsError } from "../../../sdk/src/errors/ReceiptsError.js";
import { readSource } from "./verify.js";
export function sampleFiles() {
  return readdirSync(join(ROOT, "samples"), { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".eml"))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => ({
      id: hashText(e.name).slice(2, 18),
      path: join(ROOT, "samples", e.name),
    }));
}
export function inboxSource(id: string) {
  const item = sampleFiles().find((f) => f.id === id);
  if (!item || lstatSync(item.path).isSymbolicLink())
    throw new ReceiptsError("NOT_FOUND");
  return readSource(item.path);
}
export function inbox() {
  return sampleFiles().flatMap((file) => {
    try {
      const metadata = extractMetadata(parseEml(readSource(file.path)));
      return [
        {
          id: file.id,
          sender: metadata.fromDomain,
          subject: metadata.subject,
          date: metadata.date.toISOString(),
        },
      ];
    } catch {
      return [];
    }
  });
}
