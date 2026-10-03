/// <reference types="vite/client" />
// Browser-safe metadata generated from the SDK's public exports, never its Node internals.
declare module "virtual:receipts-sdk-contract" {
  export const errorCodes: typeof import("@receipts-only/sdk").ERROR_CODES;
  export const errorMessages: Record<
    import("@receipts-only/sdk").ErrorCode,
    string
  >;
  export const deployment: {
    chainId: number;
    address: string;
    blockNumber: string;
    txHash: string;
  };
}
