// Friendly full-screen rejection using only a stable error code, never raw source in navigation.
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ReceiptText } from "lucide-react";
import { Stamp } from "@/components/receipt/Stamp";
import { Button } from "@/components/ui/button";
import { bounceCodes } from "@/components/common/ErrorView";
import { errorCodes, errorMessages, type ErrorCode } from "@/lib/sdk";
export default function Bounce() {
  const [params] = useSearchParams();
  const value = params.get("code");
  const code: ErrorCode =
    value &&
    Object.hasOwn(errorCodes, value) &&
    bounceCodes.has(value as ErrorCode)
      ? (value as ErrorCode)
      : "NOT_SIGNED";
  const preview = params.get("preview") === "1";
  return (
    <section className="container bounce-page">
      <div className="bounce-inner">
        <div className="stamp-area">
          <Stamp denied />
        </div>
        {preview && (
          <p className="eyebrow justify-center mt-4">
            Preview · no email was checked
          </p>
        )}
        <h1>
          Nice try.
          <br />
          Where’s your receipt?
        </h1>
        <p className="lead">
          Big opinions are welcome. A signed receipt goes first.
        </p>
        <p
          className="text-sm muted max-w-lg mx-auto"
          role={preview ? undefined : "alert"}
        >
          {preview
            ? "This is the front door a no-receipt reviewer meets. Want to try it with an original email?"
            : errorMessages[code]}
        </p>
        <div className="row mt-8">
          <Button asChild>
            <Link to="/review/new">
              Bring a real receipt
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/merchants">Just browsing? Come in.</Link>
          </Button>
        </div>
        <div className="notice text-left max-w-xl mx-auto mt-10">
          <ReceiptText size={21} aria-hidden="true" />
          <div>
            <strong>What gets through the app?</strong>
            <p className="text-sm mt-2">
              An original Zomato email with a passing DKIM signature, required
              signed headers and a date within 90 days. A screenshot won’t work.
              An inline forward usually won’t preserve the original signature.
            </p>
            <p className="text-xs muted">
              The merchant template is still unvalidated. This is a local SDK
              gate; direct contract calls can bypass it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
