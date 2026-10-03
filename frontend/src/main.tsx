// App providers use memory-only state. There is no analytics, session replay or service worker.
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { LazyMotion, MotionConfig } from "framer-motion";
import { queryClient } from "@/lib/query";
import { walletConfig } from "@/lib/wallet";
import { router } from "./router";
import "./styles/globals.css";
const motionFeatures = () =>
  import("./lib/motion-features").then((module) => module.default);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={walletConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          <LazyMotion features={motionFeatures}>
            <RouterProvider router={router} />
          </LazyMotion>
        </MotionConfig>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
