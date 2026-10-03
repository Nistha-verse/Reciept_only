// Unknown routes have an accessible recovery path instead of a blank page.
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="narrow page">
      <p className="eyebrow">404 / MISSING FROM THE LEDGER</p>
      <h1 className="!text-5xl">No receipt for this page.</h1>
      <p className="lead">
        That address doesn’t point to a page in Receipts Only.
      </p>
      <Button asChild>
        <Link to="/">Back to the front door</Link>
      </Button>
    </div>
  );
}
