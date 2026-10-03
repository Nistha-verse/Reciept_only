// Optional wallet libraries load only when the user asks to inspect wallet status.
import { lazy, Suspense, useState } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
const WalletDetails = lazy(() => import("./WalletDetails"));
export function NetworkGuard() {
  const [opened, setOpened] = useState(false);
  if (opened) return <Suspense fallback={<Button variant="outline" size="small" disabled>Opening wallet…</Button>}><WalletDetails /></Suspense>;
  return <Button variant="outline" size="small" onClick={() => setOpened(true)}><Wallet />Demo wallet</Button>;
}
