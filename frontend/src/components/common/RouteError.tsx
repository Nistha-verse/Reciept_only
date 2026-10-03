// Route errors deliberately omit exception details that could include sensitive inputs.
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
export function RouteError() {
  return (
    <main id="main" className="narrow page">
      <span className="eyebrow">Something didn’t load</span>
      <h1 className="!text-4xl">Let’s get you back on track.</h1>
      <p className="lead">
        This view could not be opened. Your email has not been logged or saved.
      </p>
      <div className="row">
        <Button onClick={() => window.location.reload()}>
          Reload this page
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    </main>
  );
}
