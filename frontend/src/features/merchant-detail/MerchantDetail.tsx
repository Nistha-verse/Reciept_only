// Poll public reviews and paginate the loaded set; no unsupported cursor/subscription is implied.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Info, RefreshCw } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";
import { useMerchants } from "@/hooks/useMerchants";
import { toError } from "@/lib/sdk";
import { shortHash } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/review/StarRating";
import { RatingHistogram } from "@/components/review/RatingHistogram";
import { ReviewCard } from "@/components/review/ReviewCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeletons } from "@/components/common/Skeletons";
import { ErrorView } from "@/components/common/ErrorView";
export default function MerchantDetail() {
  const { merchantId } = useParams();
  if (!merchantId || !/^0x[0-9a-fA-F]{64}$/.test(merchantId))
    return (
      <div className="narrow page">
        <ErrorView code="NOT_FOUND" />
        <Button asChild variant="outline" className="mt-5">
          <Link to="/merchants">Browse merchants</Link>
        </Button>
      </div>
    );
  return <Detail merchantId={merchantId} />;
}
function Detail({ merchantId }: { merchantId: string }) {
  const query = useReviews(merchantId),
    merchants = useMerchants();
  const [shown, setShown] = useState(6);
  useEffect(() => setShown(6), [merchantId]);
  const merchant = merchants.data?.find(
    (m) => m.merchantId.toLowerCase() === merchantId.toLowerCase(),
  );
  const rows = query.data ?? [];
  return (
    <div className="container page">
      <Link to="/merchants" className="row link text-xs mb-8">
        <ArrowLeft size={14} />
        All merchants
      </Link>
      <div className="section-heading">
        <div>
          <p className="eyebrow">A PERMANENT PLACE FOR YOUR EXPERIENCE</p>
          <h1 className="!text-[clamp(2.8rem,5vw,4.5rem)] mb-4">
            {merchant?.merchantName ??
              rows[0]?.merchantName ??
              shortHash(merchantId)}
          </h1>
          <p className="muted text-sm mb-0">
            {merchant?.count ?? rows.length} public{" "}
            {rows.length === 1 ? "review" : "reviews"} · Base Sepolia
          </p>
        </div>
        <Button asChild>
          <Link to="/review/new">
            Add your experience
            <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className="detail-layout">
        <section aria-label="Merchant reviews">
          <div className="spread mb-6">
            <h2 className="!text-xl mb-0">The reviews</h2>
            <button
              type="button"
              className="row text-xs muted"
              onClick={() => void query.refetch()}
              aria-label="Refresh reviews"
            >
              <RefreshCw size={13} />
              Updates every 15s
            </button>
          </div>
          {query.isPending ? (
            <Skeletons count={2} />
          ) : query.isError ? (
            <ErrorView
              code={toError(query.error).code}
              retry={() => void query.refetch()}
            />
          ) : rows.length ? (
            <div className="stack">
              {rows.slice(0, shown).map((review) => (
                <ReviewCard
                  key={`${review.txHash}:${review.logIndex}`}
                  review={review}
                />
              ))}
              {shown < rows.length && (
                <Button
                  variant="outline"
                  onClick={() => setShown((n) => n + 6)}
                >
                  Load more reviews ({rows.length - shown} remaining)
                </Button>
              )}
              <p className="mono text-xs muted text-center">
                Showing {Math.min(shown, rows.length)} of {rows.length} loaded
                reviews
              </p>
            </div>
          ) : (
            <EmptyState
              title="Your experience could be the first."
              description="No public reviews were found for this merchant."
              action={
                <Button asChild>
                  <Link to="/review/new">Bring a receipt</Link>
                </Button>
              }
            />
          )}
        </section>
        <aside className="detail-sidebar stack">
          <div className="panel">
            <p className="eyebrow">The overall picture</p>
            <div className="row items-end mb-5">
              <strong className="rating-value">
                {merchant ? merchant.average.toFixed(1) : "—"}
              </strong>
              <span className="muted text-sm pb-1">out of 5</span>
            </div>
            {merchant && <StarRating value={merchant.average} size={18} />}
            <div className="mt-6">
              <RatingHistogram reviews={rows} />
            </div>
          </div>
          <div className="notice">
            <Info size={17} aria-hidden="true" />
            <div>
              <strong>On-chain ≠ verified purchase.</strong>
              <p className="text-xs mt-2">
                The app checks email signatures locally. The contract accepts
                direct calls too, so this badge confirms a public record, not
                receipt authenticity.
              </p>
              <Link className="link text-xs" to="/about">
                Read the limits
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
