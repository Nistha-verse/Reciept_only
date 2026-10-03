// Search real merchant aggregates; unsupported providers stay visibly disabled.
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowUpRight, Utensils, ArrowRight } from "lucide-react";
import { useMerchants } from "@/hooks/useMerchants";
import { toError } from "@/lib/sdk";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/review/StarRating";
import { ErrorView } from "@/components/common/ErrorView";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeletons } from "@/components/common/Skeletons";
export default function Merchants() {
  const query = useMerchants();
  const [search, setSearch] = useState("");
  const rows =
    query.data?.filter((m) =>
      m.merchantName.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];
  return (
    <div className="container page">
      <p className="eyebrow">THE PUBLIC LEDGER</p>
      <div className="section-heading">
        <div>
          <h1 className="!text-[clamp(2.7rem,5vw,4.5rem)] mb-5">
            Find your next honest opinion.
          </h1>
          <p className="lead mb-0">
            Public reviews. On-chain counts. No paid placement.
          </p>
        </div>
        <Button asChild>
          <Link to="/review/new">
            Post a review
            <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className="filters">
        <div className="search-wrap">
          <Search size={18} aria-hidden="true" />
          <label htmlFor="merchant-search" className="sr-only">
            Search merchants
          </label>
          <input
            id="merchant-search"
            className="field"
            placeholder="Search merchants…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="filter-tabs" aria-label="Supported providers">
          <button aria-pressed="true" type="button">
            Zomato
          </button>
          <button
            disabled
            type="button"
            title="Swiggy is not supported by the current backend"
          >
            Swiggy · soon
          </button>
          <button
            disabled
            type="button"
            title="Amazon is not supported by the current backend"
          >
            Amazon · soon
          </button>
        </div>
      </div>
      <p className="text-xs muted mb-7">
        Merchant extraction is awaiting a real Zomato template. Accepted mail
        currently uses the “Zomato order” fallback.
      </p>
      {query.isPending ? (
        <Skeletons />
      ) : query.isError ? (
        <ErrorView
          code={toError(query.error).code}
          retry={() => void query.refetch()}
        />
      ) : rows.length ? (
        <>
          <p className="mono text-xs muted mb-5" role="status">
            {rows.length} {rows.length === 1 ? "merchant" : "merchants"} found
          </p>
          <div className="card-grid">
            {rows.map((merchant) => (
              <Link
                key={merchant.merchantId}
                className="merchant-card"
                to={`/merchants/${merchant.merchantId}`}
              >
                <div className="spread">
                  <span className="merchant-icon">
                    <Utensils size={23} strokeWidth={1.4} aria-hidden="true" />
                  </span>
                  <span className="badge">Public ledger</span>
                </div>
                <h3>{merchant.merchantName}</h3>
                <p className="muted text-xs mb-0">
                  {merchant.merchantName === "Zomato order"
                    ? "Zomato · fallback merchant group"
                    : "Name from local registry"}
                </p>
                <div className="spread merchant-card-bottom">
                  <div className="row !gap-2">
                    <strong className="mono text-sm">
                      {merchant.average.toFixed(1)}
                    </strong>
                    <StarRating value={merchant.average} />
                    <span className="muted text-xs">({merchant.count})</span>
                  </div>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title={
            search
              ? "No match. No made-up results."
              : "Every ledger starts somewhere."
          }
          description={
            search
              ? "Try a different merchant name, or clear your search."
              : "There are no visible merchant reviews yet. Post a supported receipt to start the conversation."
          }
          action={
            search ? (
              <Button variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            ) : (
              <Button asChild>
                <Link to="/review/new">Post the first review</Link>
              </Button>
            )
          }
        />
      )}
    </div>
  );
}
