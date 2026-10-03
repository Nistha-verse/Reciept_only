// Progress reflects completed HTTP actions; no fabricated proof stages or percentages.
import { Check } from "lucide-react";
import { STEPS, type Step } from "@/store/wizard";
export function ProgressStepper({ step }: { step: Step }) {
  return (
    <ol className="stepper" aria-label="Review progress">
      {STEPS.map((label, index) => (
        <li key={label} aria-current={index === step ? "step" : undefined}>
          <span
            className={`step-circle ${index < step ? "complete" : ""}`}
            aria-hidden="true"
          >
            {index < step ? (
              <Check size={14} />
            ) : (
              String(index + 1).padStart(2, "0")
            )}
          </span>
          <span>
            {label}
            <span className="sr-only">
              {index < step
                ? ", complete"
                : index === step
                  ? ", current step"
                  : ", upcoming"}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
