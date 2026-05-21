/**
 * Wagmi config: usa la chain Braga del SDK de Arkiv.
 *
 * Braga es un viem chain (defineChain), wagmi-compatible nativo.
 * Sin manualmente declarar RPC/explorer — todo viene del SDK.
 */

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { braga } from "@arkiv-network/sdk/chains";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

if (!projectId && typeof window === "undefined") {
  // Solo warn en build/dev — no romper si el dev olvidó setearlo
  // eslint-disable-next-line no-console
  console.warn(
    "[wagmi] NEXT_PUBLIC_WC_PROJECT_ID missing. WalletConnect will not work. " +
      "Get one at https://cloud.walletconnect.com",
  );
}

export const wagmiConfig = getDefaultConfig({
  appName: "Veil",
  projectId: projectId || "veil-dev-placeholder",
  chains: [braga],
  ssr: true,
});
