// Read retries are explicit; submission mutations never retry automatically.
import { QueryClient } from "@tanstack/react-query";
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      gcTime: 60000,
      retry: false,
      refetchOnWindowFocus: true,
    },
    mutations: { retry: false, gcTime: 0 },
  },
});
