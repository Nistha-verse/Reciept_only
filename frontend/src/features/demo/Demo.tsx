// Honest judge walkthrough: real chain reads, explicit synthetic labels, no invented sandbox.
import { Link } from "react-router-dom";
import { ArrowRight, FlaskConical, AlertTriangle } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";
import { toError } from "@/lib/sdk";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/review/ReviewCard";
import { ErrorView } from "@/components/common/ErrorView";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeletons } from "@/components/common/Skeletons";
export default function Demo() {
  const reviews = useReviews();
  return (
    <div className="container page">
      <span className="eyebrow">
        <FlaskConical size={15} />
        THE JUDGE’S TABLE
      </span>
      <h1 className="!text-[clamp(3rem,5vw,4.5rem)] mb-5">
        Try the idea.
        <br />
        Know the limits.
      </h1>
      <p className="lead">
        A real testnet. A transparent demo. Nothing passed off as a purchase.
      </p>
      <div className="demo-banner">
        <div className="row mb-3">
          <span className="badge badge-filled">
            Stage 1 demo · public testnet
          </span>
          <AlertTriangle size={17} aria-hidden="true" />
        </div>
        <p className="text-sm mb-2">
          There is no separate sandbox contract. Demo reuse salts the nullifier
          and posts another <strong>real, permanent Base Sepolia review</strong>
          .
        </p>
        <p className="text-xs muted mb-0">
          The deployed receipt demo used a synthetic signed email, not a
          friend’s real order. No genuine order seed data is claimed.
        </p>
      </div>
      <div className="steps-grid mt-10 mb-12">
        <div className="step-card">
          <span className="step-number">01 / THE BOUNCE</span>
          <h3>No receipt, no entry.</h3>
          <p>
            Preview the rejection screen, then try an unsigned email through the
            actual checker.
          </p>
          <Button asChild variant="outline">
            <Link to="/review/bounced?preview=1">
              Meet the bouncer
              <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="step-card">
          <span className="step-number">02 / THE REAL REQUEST</span>
          <h3>Bring a supported source.</h3>
          <p>
            Verification and posting run through the same local SDK as the
            normal flow.
          </p>
          <Button asChild variant="outline">
            <Link to="/review/new">
              Check a receipt
              <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="step-card">
          <span className="step-number">03 / EXPLICIT REUSE</span>
          <h3>Demo mode, on purpose.</h3>
          <p>
            A new salt allows another review. It’s visibly labeled, and never
            resets or deletes chain history.
          </p>
          <Button asChild variant="outline">
            <Link to="/review/new?demo=1">
              Open demo reuse
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
      <div className="notice mb-12">
        <div>
          <strong className="text-sm">
            Need a repeatable test without a real receipt?
          </strong>
          <p className="text-sm mt-2 mb-0">
            Run <code>npm run test:local</code> for the existing SDK’s signed
            synthetic flow. To seed supported files in <code>samples/</code>,
            run <code>npm run cli -- demo-seed --json</code>. Invalid receipts
            are skipped.
          </p>
        </div>
      </div>
      <div className="section-heading">
        <div>
          <p className="eyebrow">ACTUAL PUBLIC RECORDS</p>
          <h2>What’s on the chain now.</h2>
        </div>
        <Link to="/merchants" className="link text-sm">
          Browse all merchants
        </Link>
      </div>
      {reviews.isPending ? (
        <Skeletons />
      ) : reviews.isError ? (
        <ErrorView
          code={toError(reviews.error).code}
          retry={() => void reviews.refetch()}
        />
      ) : reviews.data.length ? (
        <div className="card-grid">
          {reviews.data.slice(0, 6).map((review) => (
            <ReviewCard
              key={`${review.txHash}:${review.logIndex}`}
              review={review}
              showMerchant
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No demo reviews to show yet."
          description="We won’t silently substitute fake customer data. Run the local flow, or bring a valid supported receipt."
        />
      )}
    </div>
  );
}
