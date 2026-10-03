// Exhaustive, public-SDK-sourced messages and a single stable error presentation.
import type { ErrorCode } from "@receipts-only/sdk";
import { AlertCircle, ArrowUpRight, RotateCcw } from "lucide-react";
import { errorMessages } from "@/lib/sdk";
import { Button } from "@/components/ui/button";
export const errorTitles: Record<ErrorCode, string> = {
  EMAIL_PARSE_FAILED: "That source needs another look",
  NOT_SIGNED: "No signed receipt found",
  TAMPERED: "The signature didn’t check out",
  UNSUPPORTED_SENDER: "This provider isn’t supported yet",
  DKIM_POLICY_FAILED: "This signature isn’t sufficient",
  TOO_OLD: "This receipt has expired",
  EMAIL_IN_FUTURE: "This receipt is dated in the future",
  DNS_UNAVAILABLE: "We couldn’t look up the signing key",
  ALREADY_USED: "One receipt. One review.",
  INVALID_RATING: "Pick a rating",
  REVIEW_EMPTY: "Add your experience",
  REVIEW_TOO_LONG: "A little shorter, please",
  TX_FAILED: "The local connection needs attention",
  TX_PENDING: "Your transaction may still be pending",
  ENV_INVALID: "The local bridge needs setup",
  INVALID_INPUT: "Check the form",
  NOT_FOUND: "We couldn’t find that item",
  FORBIDDEN: "Local access only",
  RATE_LIMITED: "Let’s take a short breather",
  BODY_TOO_LARGE: "That file is too large",
};
export const bounceCodes = new Set<ErrorCode>([
  "EMAIL_PARSE_FAILED",
  "NOT_SIGNED",
  "TAMPERED",
  "UNSUPPORTED_SENDER",
  "DKIM_POLICY_FAILED",
  "TOO_OLD",
  "EMAIL_IN_FUTURE",
]);
export function ErrorView({
  code,
  retry,
  txHash,
  compact = false,
}: {
  code: ErrorCode;
  retry?: () => void;
  txHash?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "notice" : "error-panel"} role="alert">
      <AlertCircle size={20} aria-hidden="true" />
      <div>
        <h3 className={compact ? "!text-sm !mb-1" : ""}>{errorTitles[code]}</h3>
        <p className="muted text-sm mb-3">{errorMessages[code]}</p>
        {code === "TX_FAILED" && (
          <p className="text-sm muted">
            Check that <code>npm run bridge</code> is running on this device. If
            you were posting, inspect the demo wallet before trying again.
          </p>
        )}
        {code === "ALREADY_USED" && (
          <p className="text-sm muted">
            Your original review stays on-chain. Bring a different receipt, or
            use the explicitly labeled demo mode.
          </p>
        )}
        <div className="row">
          {retry && (
            <Button variant="outline" size="small" onClick={retry}>
              <RotateCcw />
              Try again
            </Button>
          )}
          {txHash && /^0x[0-9a-fA-F]{64}$/.test(txHash) && (
            <Button asChild variant="outline" size="small">
              <a
                href={`https://sepolia.basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                Check transaction
                <ArrowUpRight />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
