// Mission and honest limits: do not disguise Stage 1 as purchase enforcement or anonymity.
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
export default function About() {
  return (
    <div className="narrow page prose">
      <p className="eyebrow">WHY THIS EXISTS</p>
      <h1 className="!text-[clamp(2.7rem,5vw,4.3rem)]">
        Less manufactured praise.
        <br />
        More lived experience.
      </h1>
      <p className="lead">Receipts Only: no receipt, no opinion.</p>
      <p>
        Fake and paid reviews make ordinary decisions harder. Platforms that can
        erase inconvenient feedback make trust harder still. We’re testing a
        receipt-first review flow with permanent public records.
      </p>
      <h2>What works today</h2>
      <ul>
        <li>Local DKIM checks through a localhost-only development bridge.</li>
        <li>
          Public ratings, review events, and aggregate merchant statistics on
          Base Sepolia.
        </li>
        <li>Replay rejection for an already-used nullifier.</li>
        <li>
          No contract owner, delete function, moderator, proxy or upgrade
          mechanism.
        </li>
      </ul>
      <h2>What we don’t claim</h2>
      <ul>
        <li>
          <strong>Chain-enforced purchases:</strong> direct callers can bypass
          the SDK.
        </li>
        <li>
          <strong>Anonymous authors:</strong> public wallet activity and text
          can be identifying.
        </li>
        <li>
          <strong>Three supported providers:</strong> only Zomato domains are
          configured today.
        </li>
        <li>
          <strong>A verified merchant parser:</strong> the real template is
          unvalidated; “Zomato order” is a fallback group.
        </li>
        <li>
          <strong>Real-order seed data:</strong> the deployment demonstration
          used a synthetic signed receipt.
        </li>
        <li>
          <strong>A zero-knowledge proof:</strong> this is Stage 1. On-chain
          proofs are future work.
        </li>
      </ul>
      <h2>Spam, front-running, and cold starts</h2>
      <p>
        The bridge lightly rate-limits posting. The contract only rejects
        duplicate nullifiers, so a direct caller can invent new ones. A mempool
        watcher can steal a nullifier before the intended review is confirmed.
        Receipt selling and self-ordering are also possible.
      </p>
      <p>
        A new review network is quiet. We show honest empty states and clearly
        label recognizable synthetic demo reviews. We won’t manufacture a busy
        feed or call test fixtures real customers.
      </p>
      <h2>Permanent means permanent.</h2>
      <p>
        Keep names, phone numbers, addresses and other personal information out
        of review text. The deployed contract has no deletion pathway. Please
        use the demo with that in mind.
      </p>
      <h2>Design integration status</h2>
      <p>
        The requested Superdesign project could not be accessed by the
        authenticated CLI account. This implementation uses isolated,
        system-neutral tokens. It does not claim to reproduce the inaccessible
        project’s palette or typography.
      </p>
      <div className="row mt-8">
        <Button asChild>
          <Link to="/demo">Try the transparent demo</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/merchants">Read the public ledger</Link>
        </Button>
      </div>
    </div>
  );
}
