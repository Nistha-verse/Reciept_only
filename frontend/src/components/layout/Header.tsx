// Responsive navigation and accessible theme/menu controls.
import { Link, NavLink } from "react-router-dom";
import { ReceiptText, Moon, Sun, Menu } from "lucide-react";
import { Close } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { useUi } from "@/store/ui";
import { NetworkGuard } from "./NetworkGuard";
const links = [
  { to: "/merchants", label: "Browse merchants" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/demo", label: "Try the demo" },
];
export function Header() {
  const { theme, toggleTheme } = useUi();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Receipts Only home">
          <ReceiptText size={30} strokeWidth={1.5} aria-hidden="true" />
          <span>
            RECEIPTS ONLY<small>NO RECEIPT, NO OPINION.</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link, i) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={`nav-link ${i === 2 ? "secondary-nav" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="row !gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </Button>
          <div className="hidden min-[950px]:block">
            <NetworkGuard />
          </div>
          <div className="mobile-menu">
            <Modal
              trigger={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open navigation"
                >
                  <Menu />
                </Button>
              }
              title="Receipts Only"
              description="An honest opinion starts with a receipt."
            >
              <nav className="mobile-nav-links" aria-label="Mobile navigation">
                {[
                  ...links,
                  { to: "/review/new", label: "Post a review" },
                  { to: "/about", label: "About" },
                ].map((link) => (
                  <Close asChild key={link.to}>
                    <Link className="nav-link" to={link.to}>
                      {link.label}
                    </Link>
                  </Close>
                ))}
              </nav>
              <NetworkGuard />
            </Modal>
          </div>
        </div>
      </div>
    </header>
  );
}
