// Deterministic receipt identifier; Stage 1 does not bind it to review contents.
import { encodePacked, keccak256 } from "viem";
export const deriveNullifier = (messageId: string, domain: string) =>
  keccak256(
    encodePacked(
      ["string", "string", "string"],
      [messageId.toLowerCase(), "|", domain.toLowerCase()],
    ),
  );
