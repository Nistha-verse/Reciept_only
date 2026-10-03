// Typed ABI and deployment wrapper shared by reads and writes.
import { abi } from "./abi.js";
import type { ChainContext } from "../types/review.js";
export const contract = (context: ChainContext) => ({
  address: context.address,
  abi,
});
