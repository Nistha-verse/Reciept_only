// Illustrative receipt, explicitly not a real order or proof of verification.
import { ReceiptText } from "lucide-react";
export function ReceiptCard() {
  return (
    <div
      className="hero-visual"
      aria-label="Illustration of the receipt-first review process"
    >
      <div className="receipt hero-receipt">
        <div className="receipt-head">
          <ReceiptText size={28} className="mx-auto mb-4" aria-hidden="true" />
          <h3 className="!text-lg mb-1">Receipts Only</h3>
          <span className="text-[10px] muted uppercase tracking-widest">
            A little paper. A real opinion.
          </span>
        </div>
        <div className="receipt-row mt-4">
          <span>01 × YOUR RECEIPT</span>
          <strong>LOCAL</strong>
        </div>
        <div className="receipt-row">
          <span>01 × YOUR EXPERIENCE</span>
          <strong>PUBLIC</strong>
        </div>
        <div className="receipt-row">
          <span>00 × DELETE BUTTONS</span>
          <strong>NONE</strong>
        </div>
        <div className="receipt-row receipt-total">
          <span>THE POINT</span>
          <span>KEEP IT HONEST.</span>
        </div>
        <div className="stamp-area">
          <span className="stamp">Receipt first</span>
        </div>
        <div className="barcode" aria-hidden="true" />
        <p className="receipt-foot mb-0">
          ILLUSTRATION · NOT A REAL ORDER
          <br />
          Stage 1 · Base Sepolia
        </p>
      </div>
      <span className="receipt-tag">NO RECEIPT, NO OPINION.</span>
    </div>
  );
}
