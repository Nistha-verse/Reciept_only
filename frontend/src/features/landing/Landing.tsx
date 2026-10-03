// Landing uses actual review data and an explicitly illustrative receipt visual.
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceiptCard } from "@/components/receipt/ReceiptCard";
import { ReviewCard } from "@/components/review/ReviewCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorView } from "@/components/common/ErrorView";
import { Skeletons } from "@/components/common/Skeletons";
import { useReviews } from "@/hooks/useReviews";
import { toError } from "@/lib/sdk";
export default function Landing() {
  const reviews = useReviews();
  return (
    <>
      <div className="container">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <p className="eyebrow">
              <span className="status-dot" aria-hidden="true" />
              Opinion, meet accountability.
            </p>
            <h1 id="hero-title">
              <span>No receipt.</span>
              <span className="outline-word">No opinion.</span>
            </h1>
            <p className="lead">Only people who actually ordered can talk.</p>
            <p className="muted text-sm max-w-md">
              That’s the goal. Start with a signed receipt, share your
              experience, and leave a review with no delete button.
            </p>
            <div className="row hero-actions">
              <Button asChild>
                <Link to="/review/new">
                  Post a review
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/merchants">Browse merchants</Link>
              </Button>
            </div>
            <div className="row muted text-xs">
              <LockKeyhole size={13} aria-hidden="true" />
              <span>Your email never leaves this device.</span>
            </div>
            <p className="text-[11px] muted mt-2">
              Processed by your local bridge. Stage 1 does not enforce receipts
              on-chain.
            </p>
          </div>
          <ReceiptCard />
        </section>
        <div className="facts-bar">
          <div className="fact">
            <strong className="row !gap-2">
              <ReceiptText size={15} />
              Receipt-first
            </strong>
            <span>LOCAL SIGNATURE CHECK</span>
          </div>
          <div className="fact">
            <strong className="row !gap-2">
              <LockKeyhole size={15} />
              Your device
            </strong>
            <span>NO REMOTE EMAIL UPLOAD</span>
          </div>
          <div className="fact">
            <strong className="row !gap-2">
              <Check size={15} />
              One identifier, once
            </strong>
            <span>ON-CHAIN REPLAY CHECK</span>
          </div>
          <div className="fact">
            <strong className="row !gap-2">
              <ShieldCheck size={15} />
              Here to stay
            </strong>
            <span>PUBLIC, PERMANENT REVIEWS</span>
          </div>
        </div>
        <section className="section" aria-labelledby="how-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Less noise. More experience.</p>
              <h2 id="how-heading">The receipt does the talking.</h2>
            </div>
            <Link to="/how-it-works" className="row link text-sm">
              The full story
              <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="steps-grid">
            {[
              {
                title: "Bring the receipt.",
                body: "Upload the original email, paste its source, or select a receipt from your local inbox.",
              },
              {
                title: "Let your device check.",
                body: "The local SDK checks the email’s DKIM signature, signed headers, provider and date.",
              },
              {
                title: "Tell it like it was.",
                body: "Rate your experience. Your text goes to Base Sepolia, where this contract has no delete or edit function.",
              },
            ].map((step, index) => (
              <article className="step-card" key={step.title}>
                <span className="step-number">0{index + 1} /</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          className="bounce-teaser"
          aria-labelledby="bounce-teaser-title"
        >
          <div>
            <span className="eyebrow !mb-0">
              For the professional five-star enthusiast
            </span>
            <h2 id="bounce-teaser-title">
              Got an opinion.
              <br />
              Forgot the receipt?
            </h2>
          </div>
          <Button asChild variant="inverse">
            <Link to="/review/bounced?preview=1">
              Try the front door
              <ArrowRight />
            </Link>
          </Button>
        </section>
        <section className="section" aria-labelledby="recent-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span className="status-dot" aria-hidden="true" />
                Recent public reviews · updates every 15s
              </p>
              <h2 id="recent-heading">Straight from the chain.</h2>
            </div>
            <Link to="/merchants" className="row link text-sm">
              Explore merchants
              <ArrowUpRight size={15} />
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
              {reviews.data.slice(0, 3).map((review) => (
                <ReviewCard
                  key={`${review.txHash}:${review.logIndex}`}
                  review={review}
                  showMerchant
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="The first opinion is still yours."
              description="No visible reviews yet. We won’t fill this space with made-up customer stories."
              action={
                <Button asChild>
                  <Link to="/review/new">
                    Bring a receipt
                    <ArrowRight />
                  </Link>
                </Button>
              }
            />
          )}
        </section>
        <aside className="notice mb-16">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <strong>Built in public. Limits included.</strong>
            <p className="mt-1">
              Stage 1 checks receipts off-chain. Anyone can bypass the app and
              call the contract directly. Reviews are public and
              wallet-linkable.{" "}
              <Link className="link" to="/about">
                Read the honest limitations.
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
