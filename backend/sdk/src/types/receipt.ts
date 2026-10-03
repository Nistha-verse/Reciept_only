// Verified off-chain metadata only: never contains raw email or DKIM signature.
import type { Hex } from "viem";
export interface VerifiedReceipt {
  merchantId: Hex;
  merchantName: string;
  nullifier: Hex;
  orderDate: string;
  providerId: string;
}
