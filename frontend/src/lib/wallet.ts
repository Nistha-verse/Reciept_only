// Optional injected wallet is network inspection only; the existing local bridge signs posts.
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { baseSepolia } from "wagmi/chains";
export const walletConfig = createConfig({
  chains: [baseSepolia],
  connectors: [injected()],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org", { retryCount: 0 }),
  },
  storage: null,
  multiInjectedProviderDiscovery: false,
});
