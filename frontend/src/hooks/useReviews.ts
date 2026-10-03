// Poll existing read API; no fabricated subscription or unsupported cursor protocol.
import { useQuery } from "@tanstack/react-query";
import { sdk } from "@/lib/sdk";
export const useReviews = (merchantId?: string) =>
  useQuery({
    queryKey: ["reviews", merchantId ?? "all"],
    queryFn: ({ signal }) => sdk.reviews(merchantId, signal),
    refetchInterval: 15000,
  });
