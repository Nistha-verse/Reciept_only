// Accessible loading placeholders with one announcement, not repeated fake content.
export function Skeletons({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading reviews" className="card-grid">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card" aria-hidden="true">
          <div className="skeleton w-1/3 mb-8" />
          <div className="skeleton mb-3" />
          <div className="skeleton w-4/5 mb-3" />
          <div className="skeleton w-1/2" />
        </div>
      ))}
    </div>
  );
}
