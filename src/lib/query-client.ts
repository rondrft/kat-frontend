import { QueryClient } from "@tanstack/react-query";
import { AppError, isUnauthorizedError } from "@/lib/errors";

function handleQueryError(error: unknown): void {
  if (isUnauthorizedError(error)) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("kat:unauthorized"));
    }
  }
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
          if (error instanceof AppError && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        onError: handleQueryError,
      },
    },
  });
}
