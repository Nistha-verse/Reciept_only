// Explicit permanence and sender acknowledgement before the existing bridge's single post request.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  LoaderCircle,
  LockKeyhole,
  Send,
} from "lucide-react";
import { useWizard } from "@/store/wizard";
import { useHealth } from "@/hooks/useMerchants";
import { useSubmitReview } from "@/hooks/useSubmitReview";
import { toError } from "@/lib/sdk";
import { shortHash } from "@/lib/utils";
import { contractUrl, faucetUrl } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { ErrorView } from "@/components/common/ErrorView";
import { StarRating } from "@/components/review/StarRating";
export function Publish() {
  const draft = useWizard(),
    health = useHealth(),
    submission = useSubmitReview();
  const [acknowledged, setAcknowledged] = useState(false);
  const error = submission.error ? toError(submission.error) : undefined;
  useEffect(() => {
    if (!submission.isPending) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [submission.isPending]);
  if (submission.isPending)
    return (
      <div className="busy-state">
        <LoaderCircle size={38} className="spinner" aria-hidden="true" />
        <h2>Making it part of the record.</h2>
        <p role="status" className="muted text-sm">
          The local bridge is rechecking your receipt and submitting your
          review.
        </p>
        <p className="text-sm muted">
          This request includes simulation, submission and confirmation. The
          current backend does not stream individual stages.
        </p>
        <div className="notice text-left mt-6">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>
            Keep this page open. Don’t submit again if the connection drops—a
            transaction may already be in flight.
          </p>
        </div>
      </div>
    );
  return (
    <>
      <span className="eyebrow">04 / Read it once. Post it once.</span>
      <h2>Ready to make it public?</h2>
      <div className="receipt my-7 !p-6">
        <div className="spread">
          <strong className="text-sm">{draft.receipt?.merchantName}</strong>
          <StarRating value={draft.rating} />
        </div>
        <p className="text-sm font-sans whitespace-pre-wrap break-words mt-5 mb-0">
          {draft.text}
        </p>
        <div className="receipt-row receipt-total mt-5">
          <span>NETWORK</span>
          <span>BASE SEPOLIA</span>
        </div>
        <div className="receipt-row">
          <span>SENDER</span>
          <span>
            {health.data
              ? shortHash(health.data.deployer)
              : "Bridge unavailable"}
          </span>
        </div>
      </div>
      <div className="notice mt-8">
        <LockKeyhole size={18} aria-hidden="true" />
        <p>
          Your receipt stays on this device. Your{" "}
          <strong>
            review text and wallet transaction become public and permanent
          </strong>
          . The shared demo wallet is not an anonymity guarantee.
        </p>
      </div>
      <label className="row items-start text-sm mt-6">
        <input
          type="checkbox"
          className="mt-1 accent-[var(--text)]"
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.target.checked)}
        />
        <span>I understand this review can’t be edited or deleted.</span>
      </label>
      <label className="row items-start text-xs muted mt-5">
        <input
          type="checkbox"
          className="mt-1 accent-[var(--text)]"
          checked={draft.demo}
          onChange={(event) => draft.setDemo(event.target.checked)}
        />
        <span>
          Explicit demo reuse: salt this receipt’s nullifier. This creates
          another real public review.
        </span>
      </label>
      {draft.demo && (
        <div className="notice mt-4">
          <AlertTriangle size={17} aria-hidden="true" />
          <p>
            <strong>DEMO MODE: nullifier salted.</strong> Receipt reuse
            protection is deliberately bypassed for this submission.
          </p>
        </div>
      )}
      {health.isError && (
        <div className="mt-5">
          <ErrorView
            code={toError(health.error).code}
            retry={() => void health.refetch()}
          />
        </div>
      )}
      {health.data && Number(health.data.balanceETH) <= 0 && (
        <p className="notice mt-5">
          The demo wallet has no test ETH.{" "}
          <a className="link" href={faucetUrl} target="_blank" rel="noreferrer">
            Open a Base Sepolia faucet
          </a>
          .
        </p>
      )}
      {error && (
        <div className="mt-6">
          <ErrorView code={error.code} txHash={error.txHash} />
          {["TX_FAILED", "TX_PENDING"].includes(error.code) && (
            <p className="text-sm muted mt-4">
              Submission is locked after this uncertain result.{" "}
              <a
                className="link"
                href={
                  health.data
                    ? `https://sepolia.basescan.org/address/${health.data.deployer}`
                    : contractUrl
                }
                target="_blank"
                rel="noreferrer"
              >
                Check wallet activity first
              </a>
              . Don’t automatically replay the request.
            </p>
          )}
          {error.code === "ALREADY_USED" && (
            <Button asChild variant="outline" className="mt-4">
              <Link to="/merchants">Read existing reviews</Link>
            </Button>
          )}
        </div>
      )}
      <div className="wizard-actions">
        <Button
          variant="ghost"
          onClick={() => draft.dispatch({ type: "BACK" })}
        >
          Edit review
        </Button>
        <Button
          onClick={() => submission.mutate()}
          disabled={
            !acknowledged ||
            !health.data ||
            Number(health.data.balanceETH) <= 0 ||
            submission.isError
          }
        >
          <Send />
          Post to Base Sepolia
        </Button>
      </div>
      <a
        className="row text-xs muted link mt-5"
        href={contractUrl}
        target="_blank"
        rel="noreferrer"
      >
        Inspect the contract
        <ArrowUpRight size={12} />
      </a>
    </>
  );
}
