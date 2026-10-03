// Display stars have one readable label; form stars are native keyboard-accessible radios.
import { Star } from "lucide-react";
export function StarRating({
  value,
  size = 15,
}: {
  value: number;
  size?: number;
}) {
  return (
    <span
      className="stars"
      role="img"
      aria-label={`${value.toFixed(value % 1 ? 1 : 0)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          aria-hidden="true"
          fill={n <= Math.round(value) ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}
export function RatingInput({
  value,
  onChange,
  error,
}: {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="field-label">Your rating</legend>
      <div className="rating-input">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n}>
            <input
              className="sr-only"
              type="radio"
              name="rating"
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
              aria-describedby={error ? "rating-error" : undefined}
            />
            <Star
              size={29}
              strokeWidth={1.5}
              fill={n <= value ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </label>
        ))}
      </div>
      {error && (
        <p id="rating-error" role="alert" className="field-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
