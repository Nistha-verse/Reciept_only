// Real Stage 1 request states replace unavailable proof-worker/progress APIs.
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { sdk, toError, ReceiptsError } from "@/lib/sdk";
import { useWizard } from "@/store/wizard";
import { ProgressStepper } from "@/components/common/ProgressStepper";
import { ErrorView, bounceCodes } from "@/components/common/ErrorView";
import { Button } from "@/components/ui/button";
import { ReceiptInput } from "./ReceiptInput";
import { ReviewForm } from "./ReviewForm";
import { Publish } from "./Publish";
import { Success } from "./Success";
export default function ReviewWizard() {
  const draft = useWizard(),
    navigate = useNavigate(),
    [params] = useSearchParams();
  const controller = useRef<AbortController>();
  const alive = useRef(true);
  const [elapsed, setElapsed] = useState(0);
  const demoRequested = params.get("demo") === "1";
  useEffect(() => {
    if (demoRequested) useWizard.getState().setDemo(true);
  }, [demoRequested]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      controller.current?.abort();
    };
  }, []);
  const verification = useMutation({
    mutationKey: ["verify-receipt"],
    gcTime: 0,
    retry: false,
    mutationFn: async () => {
      const source = useWizard.getState().source;
      if (!source) throw new ReceiptsError("INVALID_INPUT");
      controller.current = new AbortController();
      useWizard.getState().dispatch({ type: "CHECKING" });
      return sdk.verify(source, controller.current.signal);
    },
    onSuccess: (receipt) => {
      if (alive.current)
        useWizard.getState().dispatch({ type: "VERIFIED", receipt });
    },
    onError: (error: unknown) => {
      if (!alive.current) return;
      if (error instanceof DOMException && error.name === "AbortError") {
        useWizard.getState().dispatch({ type: "RESET" });
        return;
      }
      const safe = toError(error);
      if (bounceCodes.has(safe.code)) {
        useWizard.getState().dispatch({ type: "RESET" });
        navigate(`/review/bounced?code=${safe.code}`);
      } else useWizard.getState().dispatch({ type: "BACK" });
    },
  });
  useEffect(() => {
    if (!verification.isPending) {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const timer = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [verification.isPending]);
  return (
    <div className="container page">
      <div className="section-heading !mb-10">
        <div>
          <p className="eyebrow">NO RECEIPT, NO OPINION.</p>
          <h1 className="!text-[clamp(2.3rem,4.5vw,3.8rem)] mb-3">
            An honest review starts here.
          </h1>
          <p className="muted text-sm mb-0">
            Stage 1: your device checks the receipt’s signature.
          </p>
        </div>
        <span className="badge">
          <ShieldCheck size={13} />
          Local verification
        </span>
      </div>
      <div className="wizard-layout">
        <aside className="wizard-aside">
          <ProgressStepper step={draft.step} />
          <div className="privacy-note">
            <LockKeyhole size={17} aria-hidden="true" />
            <p>
              Your email stays on this device. Your review will be public. The
              app and contract have different trust boundaries.
            </p>
          </div>
        </aside>
        <div className="wizard-card">
          {draft.step === 0 && (
            <>
              <ReceiptInput
                check={() => verification.mutate()}
                checking={verification.isPending}
              />
              {verification.isError &&
                !(verification.error instanceof DOMException) && (
                  <div className="mt-5">
                    <ErrorView code={toError(verification.error).code} />
                  </div>
                )}
            </>
          )}
          {draft.step === 1 && (
            <div className="busy-state">
              <LoaderCircle className="spinner" size={38} aria-hidden="true" />
              <h2>Checking the receipt’s signature.</h2>
              <p role="status" className="muted text-sm">
                The SDK is checking DKIM, signed headers, provider policy and
                freshness on this device.
              </p>
              <p className="mono text-xs muted my-6">
                Elapsed: {elapsed}s · no proof is being generated
              </p>
              <Button
                variant="outline"
                onClick={() => controller.current?.abort()}
              >
                Cancel and clear receipt
              </Button>
            </div>
          )}
          {draft.step === 2 && <ReviewForm />}
          {draft.step === 3 && <Publish />}
          {draft.step === 4 && <Success />}
        </div>
      </div>
    </div>
  );
}
