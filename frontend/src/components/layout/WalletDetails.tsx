// Wallet controls never sign reviews; clearly distinguish the inspected wallet from the bridge sender.
import { WagmiProvider, useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { walletConfig } from "@/lib/wallet";
import { Wallet, ArrowUpRight } from "lucide-react";
import { useHealth } from "@/hooks/useMerchants";
import { shortHash } from "@/lib/utils";
import { faucetUrl } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
function WalletContent() {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const {
    switchChain,
    isPending: switching,
    error: switchError,
  } = useSwitchChain();
  const health = useHealth();
  return (
    <Modal
      defaultOpen
      trigger={
        <Button variant="outline" size="small">
          <Wallet />
          Demo wallet
        </Button>
      }
      title="Your local demo wallet"
      description="Stage 1 posts are signed by the bridge’s throwaway wallet. No private key enters this browser."
    >
      <div className="stack mt-6">
        <div className="notice">
          <div>
            <strong className="text-sm">Review sender</strong>
            <p className="mono text-xs mt-2 mb-1">
              {health.data
                ? shortHash(health.data.deployer)
                : "Start the local bridge to inspect the sender."}
            </p>
            {health.data && (
              <p className="text-xs muted mb-0">
                {Number(health.data.balanceETH).toFixed(6)} Base Sepolia ETH
              </p>
            )}
          </div>
        </div>
        <p className="text-sm muted">
          A burner-account submission API is not available. This shared wallet
          does not guarantee anonymity.
        </p>
        {health.data && Number(health.data.balanceETH) < 0.00001 && (
          <div className="notice">
            <p>
              The demo wallet is low on test ETH. Fund the sender shown above
              using a{" "}
              <a
                className="link"
                href={faucetUrl}
                target="_blank"
                rel="noreferrer"
              >
                Base Sepolia faucet
              </a>
              .
            </p>
          </div>
        )}
        <div className="border-t border-border pt-5">
          <p className="text-sm font-semibold">
            Optional: inspect your browser wallet
          </p>
          <p className="text-xs muted">
            Connecting does not change the review sender.
          </p>
          {isConnected ? (
            <div className="stack">
              <div className="mono text-xs">
                {address ? shortHash(address) : "Connected"} ·{" "}
                {chainId === 84532
                  ? "Base Sepolia"
                  : `Other network (${chainId})`}
              </div>
              {chainId !== 84532 && (
                <Button
                  onClick={() => switchChain({ chainId: 84532 })}
                  disabled={switching}
                >
                  {switching ? "Switching…" : "Switch to Base Sepolia"}
                </Button>
              )}
              <Button variant="outline" onClick={() => disconnect()}>
                Disconnect browser wallet
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              disabled={isPending || !connectors[0]}
              onClick={() => {
                const connector = connectors[0];
                if (connector) connect({ connector });
              }}
            >
              {isPending ? "Connecting…" : "Connect browser wallet"}
            </Button>
          )}
          {(error || switchError) && (
            <p className="field-error" role="alert">
              Wallet action was declined or unavailable. Check your extension
              and try again.
            </p>
          )}
        </div>
        <a
          href={faucetUrl}
          target="_blank"
          rel="noreferrer"
          className="link row text-xs"
        >
          Get Base Sepolia test ETH
          <ArrowUpRight size={13} />
        </a>
      </div>
    </Modal>
  );
}
export default function WalletDetails() { return <WagmiProvider config={walletConfig} reconnectOnMount={false}><WalletContent /></WagmiProvider>; }
