// Merchant statistics come from the bridge's SDK/contract views.
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";
export const useMerchants = () =>
  useQuery({
    queryKey: ["merchants"],
    queryFn: ({ signal }) => sdk.merchants(signal),
    refetchInterval: 15000,
  });
export const useHealth = () =>
  useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => sdk.health(signal),
    refetchInterval: 30000,
  });
