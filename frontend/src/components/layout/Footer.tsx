// Persistent trust boundary and public contract links, without anonymity overclaims.
import { Link } from "react-router-dom";
import { ArrowUpRight, ReceiptText } from "lucide-react";
import { contractUrl } from "@/lib/env";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Link className="brand" to="/">
              <ReceiptText size={22} aria-hidden="true" />
              <span>RECEIPTS ONLY</span>
            </Link>
            <p className="muted text-sm mt-3 mb-0">
              A real experience deserves a place to stay.
            </p>
          </div>
          <nav aria-label="Footer" className="row text-sm !gap-6">
            <Link to="/about" className="link">
              About & limits
            </Link>
            <Link to="/how-it-works" className="link">
              How it works
            </Link>
            <a
              className="row !gap-1 link"
              href={contractUrl}
              target="_blank"
              rel="noreferrer"
            >
              View contract
              <ArrowUpRight size={14} />
            </a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            Stage 1 · Base Sepolia testnet · No tokens. No delete button.
          </span>
          <span>
            Email checked off-chain. Public reviews are wallet-linkable.
          </span>
        </div>
      </div>
    </footer>
  );
}
