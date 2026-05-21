"use client";

/**
 * Client providers: WagmiProvider → QueryClient → RainbowKit.
 * Wrap the app in layout.tsx.
 */

import "@rainbow-me/rainbowkit/styles.css";

import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";

import { wagmiConfig } from "@/lib/wagmi";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ErrorSilencer } from "@/components/ErrorSilencer";
import { VeilAvatar } from "@/components/VeilAvatar";

export function Providers({ children }: { children: ReactNode }) {
  // useState ensures QueryClient is stable across renders without recreating it
  const [queryClient] = useState(() => new QueryClient());

  return (
    <LanguageProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={lightTheme({
              accentColor: "#000000",
              accentColorForeground: "#00e676",
              borderRadius: "none",
              fontStack: "system",
            })}
            avatar={VeilAvatar}
            modalSize="compact"
          >
            <ErrorSilencer />
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </LanguageProvider>
  );
}
