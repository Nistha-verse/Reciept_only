// Honest live connectivity and explicit browser-test labeling.
import { Link } from "react-router-dom";
import { useHealth } from "@/hooks/useMerchants";
import { isTestMode } from "@/lib/env";
export function Banner() {
  const health = useHealth();
  return (
    <>
      <div className="status-strip">
        <div className="container spread">
          <span className="row !gap-2 mono">
            <span className="status-dot" aria-hidden="true" />
            BASE SEPOLIA <span aria-hidden="true">/</span>{" "}
            {health.isPending
              ? "CONNECTING"
              : health.isError
                ? "BRIDGE OFFLINE"
                : "LOCAL BRIDGE CONNECTED"}
          </span>
          <Link className="status-explainer link" to="/how-it-works">
            Stage 1: your device checks the receipt’s signature
          </Link>
        </div>
      </div>
      {isTestMode && (
        <div className="notice rounded-none justify-center" role="status">
          <strong>MOCK API · TEST FIXTURES ONLY</strong>
          <span>
            No real receipt verification or transaction is implied by mocked
            browser tests.
          </span>
        </div>
      )}
    </>
  );
}
