// Public chain reviews are not labeled cryptographically verified: direct calls bypass the SDK.
import { ArrowUpRight, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Review } from "@/lib/sdk";
import { formatDate, shortHash } from "@/lib/utils";
import { StarRating } from "./StarRating";
export function ReviewCard({
  review,
  showMerchant = false,
}: {
  review: Review;
  showMerchant?: boolean;
}) {
  const synthetic = /synthetic/i.test(review.text);
  return (
    <article
      className="review-card"
      id={`review-${review.reviewId}`}
      aria-label={`Review ${review.reviewId}`}
    >
      <div className="spread">
        <StarRating value={review.rating} />
        <span
          className="badge"
          title="Public chain record. The contract does not check email authenticity."
        >
          <Link2 size={11} aria-hidden="true" />
          On-chain
        </span>
      </div>
      {showMerchant && (
        <h3 className="!text-base mt-5 mb-0">
          <Link to={`/merchants/${review.merchantId}`}>
            {review.merchantName}
          </Link>
        </h3>
      )}
      <p className="review-text">{review.text}</p>
      {synthetic && <p className="badge mb-4">Synthetic demo review</p>}
      <div className="spread review-meta">
        <time dateTime={new Date(Number(review.postedAt) * 1000).toISOString()}>
          {formatDate(Number(review.postedAt))}
        </time>
        {review.explorerUrl.startsWith("https://") ? (
          <a
            className="row !gap-1 link"
            href={review.explorerUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`View transaction for review ${review.reviewId}`}
          >
            {shortHash(review.txHash)}
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        ) : (
          <span>Local test</span>
        )}
      </div>
    </article>
  );
}
