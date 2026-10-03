// Aggregate the returned public review set only; show the sample size explicitly.
import type { Review } from "@/lib/sdk";
export function RatingHistogram({ reviews }: { reviews: Review[] }) {
  return (
    <div
      aria-label={`Rating distribution across ${reviews.length} loaded reviews`}
    >
      {[5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => r.rating === star).length;
        return (
          <div className="hist-row" key={star}>
            <span>{star} ★</span>
            <div className="hist-track" aria-hidden="true">
              <div
                className="hist-fill"
                style={{
                  width: `${reviews.length ? (count / reviews.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span aria-label={`${count} reviews`}>{count}</span>
          </div>
        );
      })}
      <p className="field-help mt-5">
        Based on {reviews.length} loaded public reviews.
      </p>
    </div>
  );
}
