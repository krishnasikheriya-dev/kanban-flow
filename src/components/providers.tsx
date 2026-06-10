"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // TODO: Initialize a QueryClient instance.
  // Hint: Use useState to ensure the client is only created once per session
  // so it doesn't recreate on every React render during development.

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR/App Router, setting a default staleTime prevents
            // immediate refetching on the client side
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    // TODO: Wrap children in QueryClientProvider
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
