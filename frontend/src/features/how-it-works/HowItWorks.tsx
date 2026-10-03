// Explain the deployed Stage 1 implementation and distinguish proposed Stage 2 proofs.
import { Link } from "react-router-dom";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contractUrl } from "@/lib/env";
export default function HowItWorks() {
  return (
    <div className="narrow page prose">
      <p className="eyebrow">THE SMALL PRINT, IN NORMAL WORDS</p>
      <h1 className="!text-[clamp(2.7rem,5vw,4.3rem)]">
        A receipt.
        <br />A signature.
        <br />
        Your side of the story.
      </h1>
      <p className="lead">
        Stage 1: your device checks the receipt’s signature.
      </p>
      <h2>1. Start with the original email.</h2>
      <p>
        Many email providers attach a DKIM signature: a cryptographic signature
        covering selected headers and the body. The local SDK checks it against
        a public key published in DNS. We never receive your email at a remote
        service.
      </p>
      <p>
        Original source matters. An inline forward or screenshot usually doesn’t
        preserve what was signed. Pasted text may have lost CRLF line endings;
        only the SDK normalizes that permitted difference.
      </p>
      <h2>2. A valid signature isn’t the whole check.</h2>
      <p>
        The SDK also requires an allowed, aligned Zomato sender; signed From,
        Subject, Date and Message-ID; full-body coverage; a supported strong
        key; and a receipt date within 90 days, not in the future.
      </p>
      <p>
        The original Zomato merchant/order template has not yet been validated.
        The current merchant fallback is “Zomato order”. A passing signature
        authenticates provider mail, not the meaning of a purchase.
      </p>
      <h2>3. Post the experience—not the email.</h2>
      <p>
        The SDK derives a receipt identifier called a nullifier and submits it
        with the merchant ID, rating and review text. The contract rejects an
        identifier already used. Your text is a public event; its hash and
        compact review data are stored on-chain.
      </p>
      <div className="notice">
        <LockKeyhole size={20} aria-hidden="true" />
        <p>
          <strong>Your email never leaves this device.</strong> The browser
          sends source only to your own localhost bridge. DNS receives
          selector/domain lookups. The chain receives review data, not the
          email.
        </p>
      </div>
      <h2>What the contract doesn’t do.</h2>
      <p>
        It does not verify an email signature or proof. Anyone can call it
        directly with an arbitrary unused nullifier. The SDK’s checks are an
        application gate, not an on-chain authenticity guarantee.{" "}
        <a href={contractUrl} target="_blank" rel="noreferrer" className="link">
          Inspect the verified source.
        </a>
      </p>
      <h2>Where zero-knowledge proofs would fit.</h2>
      <p>
        Stage 2 would add a locally generated proof, an on-chain verifier, a
        DKIM-key registry and a binding to the exact review and sender. Those
        components are not built into this deployment. There is no browser proof
        worker pretending to produce a proof.
      </p>
      <h2>Private source is not anonymous authorship.</h2>
      <p>
        Wallet addresses, funding trails, timing and review text can link an
        author. The bridge uses a throwaway demo wallet, but that is not an
        anonymity guarantee. Receipt selling, restaurant self-ordering and
        nullifier front-running remain limitations.
      </p>
      <p className="text-sm">
        The full threat model is documented in{" "}
        <a href="/security.txt" className="link" target="_blank" rel="noreferrer">
          docs/SECURITY.md
        </a>
        , served locally as text.
      </p>
      <div className="row mt-9">
        <Button asChild>
          <Link to="/review/new">
            Bring your receipt
            <ArrowRight />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/about">Read all limitations</Link>
        </Button>
      </div>
    </div>
  );
}
