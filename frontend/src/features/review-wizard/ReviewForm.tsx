// Client feedback is non-authoritative; SDK still validates every submitted review.
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ArrowRight } from "lucide-react";
import { useWizard } from "@/store/wizard";
import { codePoints, byteCount, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RatingInput } from "@/components/review/StarRating";
import { CodePointTextarea } from "@/components/review/CodePointTextarea";
const schema = z.object({
  rating: z.number().int().min(1, "Choose a rating from 1 to 5.").max(5),
  text: z
    .string()
    .refine((value) => !!value.trim(), "Write a review before posting.")
    .refine(
      (value) => codePoints(value) <= 280 && byteCount(value) <= 1120,
      "Keep your review within 280 Unicode code points and 1120 bytes.",
    ),
});
export function ReviewForm() {
  const draft = useWizard();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { rating: draft.rating, text: draft.text },
    mode: "onChange",
  });
  return (
    <form
      onSubmit={handleSubmit((values) => {
        draft.dispatch({ type: "WRITE", ...values });
        draft.dispatch({ type: "READY" });
      })}
    >
      <span className="eyebrow">03 / Your experience, in your words</span>
      <h2>How was it, really?</h2>
      <div className="notice mb-7">
        <Check size={18} aria-hidden="true" />
        <div>
          <strong className="text-sm">Signature checked on this device</strong>
          <p className="text-xs mt-1">
            {draft.receipt?.merchantName} ·{" "}
            {draft.receipt ? formatDate(draft.receipt.orderDate) : ""}
          </p>
        </div>
      </div>
      <Controller
        name="rating"
        control={control}
        render={({ field }) => (
          <RatingInput
            value={field.value}
            onChange={field.onChange}
            error={errors.rating?.message}
          />
        )}
      />
      <Controller
        name="text"
        control={control}
        render={({ field }) => (
          <CodePointTextarea {...field} error={errors.text?.message} />
        )}
      />
      <div className="wizard-actions">
        <Button
          variant="ghost"
          onClick={() => draft.dispatch({ type: "BACK" })}
        >
          Change receipt
        </Button>
        <Button type="submit">
          Review before posting
          <ArrowRight />
        </Button>
      </div>
    </form>
  );
}
