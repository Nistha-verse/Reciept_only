// Route-level code splitting keeps receipt forms and wallet work out of the landing route.
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { RouteError } from "@/components/common/RouteError";
import Landing from "@/features/landing/Landing";
export const router = createBrowserRouter([
  {
    element: <App />,
    HydrateFallback: () => <p className="container page" role="status">Opening Receipts Only…</p>,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Landing />, errorElement: <RouteError /> },
      {
        path: "merchants",
        lazy: async () => ({
          Component: (await import("@/features/merchants/Merchants")).default,
          ErrorBoundary: RouteError,
        }),
      },
      {
        path: "merchants/:merchantId",
        lazy: async () => ({
          Component: (await import("@/features/merchant-detail/MerchantDetail"))
            .default,
          ErrorBoundary: RouteError,
        }),
      },
      {
        path: "review/new",
        lazy: async () => ({
          Component: (await import("@/features/review-wizard/ReviewWizard"))
            .default,
          ErrorBoundary: RouteError,
        }),
      },
      {
        path: "review/bounced",
        lazy: async () => ({
          Component: (await import("@/features/bounce/Bounce")).default,
          ErrorBoundary: RouteError,
        }),
      },
      {
        path: "demo",
        lazy: async () => ({
          Component: (await import("@/features/demo/Demo")).default,
          ErrorBoundary: RouteError,
        }),
      },
      {
        path: "how-it-works",
        lazy: async () => ({
          Component: (await import("@/features/how-it-works/HowItWorks"))
            .default,
          ErrorBoundary: RouteError,
        }),
      },
      {
        path: "about",
        lazy: async () => ({
          Component: (await import("@/features/about/About")).default,
          ErrorBoundary: RouteError,
        }),
      },
      {
        path: "*",
        lazy: async () => ({
          Component: (await import("@/features/about/NotFound")).default,
        }),
      },
    ],
  },
]);
