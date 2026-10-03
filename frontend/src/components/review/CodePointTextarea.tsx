// Presentation-only codepoint/byte feedback; authoritative validation remains in the SDK.
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { codePoints, byteCount } from "@/lib/utils";
export const CodePointTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    value: string;
    error?: string;
  }
>(({ value, error, id = "review-text", ...props }, ref) => {
  const points = codePoints(value),
    bytes = byteCount(value),
    over = points > 280 || bytes > 1120;
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        What was your experience?
      </label>
      <textarea
        ref={ref}
        id={id}
        className="field min-h-36 resize-y"
        value={value}
        aria-invalid={!!error || over}
        aria-describedby={`${id}-count ${id}-help${error ? ` ${id}-error` : ""}`}
        placeholder="The food, the delivery, the little details. Keep it honest."
        {...props}
      />
      <div
        id={`${id}-count`}
        className={`counter ${over ? "over" : ""}`}
        aria-live="polite"
      >
        <span>{points} / 280 code points</span>
        <span>{bytes} / 1120 bytes</span>
      </div>
      <p id={`${id}-help`} className="field-help">
        Public and permanent. Leave out names, phone numbers, and addresses.
      </p>
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
CodePointTextarea.displayName = "CodePointTextarea";
