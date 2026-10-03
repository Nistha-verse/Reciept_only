// Shared shell, route focus, transient receipt cleanup and memory-only theme application.
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Banner } from "@/components/layout/Banner";
import { useUi } from "@/store/ui";
import { useWizard } from "@/store/wizard";
export default function App() {
  const location = useLocation(),
    theme = useUi((state) => state.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.getElementById("main")?.focus({ preventScroll: true });
    if (location.pathname !== "/review/new")
      useWizard.getState().dispatch({ type: "RESET" });
  }, [location.pathname]);
  useEffect(() => {
    const clear = () => useWizard.getState().dispatch({ type: "RESET" });
    window.addEventListener("pagehide", clear);
    return () => window.removeEventListener("pagehide", clear);
  }, []);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <Banner />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
