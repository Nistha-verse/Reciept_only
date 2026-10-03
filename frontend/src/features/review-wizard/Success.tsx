// Confirmed result and reader-derived merchant link; no frontend merchant hashing.
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useWizard } from "@/store/wizard";
import { useReviews } from "@/hooks/useReviews";
import { Stamp } from "@/components/receipt/Stamp";
import { Button } from "@/components/ui/button";
export function Success() {
  const result = useWizard((state) => state.result),
    reviews = useReviews();
  const event = reviews.data?.find((r) => r.txHash === result?.txHash);
  return (
    <div className="text-center py-7">
      <div className="stamp-area">
        <Stamp label="Posted on-chain" />
      </div>
      <h2 className="mt-9">Your experience is on the record.</h2>
      <p className="muted text-sm max-w-md mx-auto">
        The bridge checked your receipt locally and the transaction confirmed.
        No email content was posted to the chain.
      </p>
      {result?.demo && <p className="badge mx-auto my-4">Demo-salted review</p>}
      <div className="row justify-center mt-7">
        <Button asChild>
          <Link
            to={
              event
                ? `/merchants/${event.merchantId}#review-${event.reviewId}`
                : "/merchants"
            }
          >
            See your review
            <ArrowRight />
          </Link>
        </Button>
        {result?.explorerUrl.startsWith("https://") && (
          <Button asChild variant="outline">
            <a href={result.explorerUrl} target="_blank" rel="noreferrer">
              View transaction
              <ArrowUpRight />
            </a>
          </Button>
        )}
      </div>
      {!event && (
        <p className="field-help mt-5">
          The chain reader may take a moment to catch up. It refreshes every 15
          seconds.
        </p>
      )}
      <div className="notice text-left mt-9">
        <p>
          <strong>One receipt, one review</strong> in the normal SDK flow. Your
          source has been cleared from this browser’s app state. Stage 1’s
          contract does not verify email authenticity.
        </p>
      </div>
    </div>
  );
}
