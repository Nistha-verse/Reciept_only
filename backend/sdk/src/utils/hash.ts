// UTF-8 keccak hashing and normalized merchant IDs.
import { keccak256, toBytes } from "viem";
import { normalizeMerchant } from "./text.js";
export const hashText = (value: string) => keccak256(toBytes(value));
export const merchantHash = (name: string) => hashText(normalizeMerchant(name));
