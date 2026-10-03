// Fixed supported networks; local mode is explicit and never silently selected.
import { baseSepolia, hardhat } from "viem/chains";
export { baseSepolia, hardhat };
export const explorer = (hash: string) =>
  `https://sepolia.basescan.org/tx/${hash}`;
