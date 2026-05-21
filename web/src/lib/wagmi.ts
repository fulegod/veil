/**
 * Wagmi config: Braga chain + lista de wallets reducida.
 *
 * Decisión: NO usamos `getDefaultConfig` de RainbowKit porque por debajo arrastra
 * WalletConnect/Reown como connector, que sin `NEXT_PUBLIC_WC_PROJECT_ID` real
 * tira errores ruidosos en consola (`Connection interrupted`, `403`, etc.).
 *
 * En su lugar declaramos manualmente los connectors que SÍ funcionan sin
 * servicio externo:
 *   - injected (MetaMask, Rabby, Brave Wallet, etc.)
 *   - metaMask (módulo dedicado, mejor UX en el modal)
 *   - coinbase (extension)
 *
 * Si en el futuro queremos WalletConnect QR para móviles, basta con setear
 * NEXT_PUBLIC_WC_PROJECT_ID y agregar `walletConnectWallet` al array.
 */

import { createConfig, http } from "wagmi";
import { braga } from "@arkiv-network/sdk/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID?.trim();
const hasRealProjectId = Boolean(projectId);

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: hasRealProjectId
        ? [metaMaskWallet, walletConnectWallet, coinbaseWallet, injectedWallet]
        : [metaMaskWallet, coinbaseWallet, injectedWallet],
    },
  ],
  {
    appName: "Veil",
    // Required by the SDK type signature even if WC is not in the wallet list.
    // RainbowKit only actually uses it when walletConnectWallet is included.
    projectId: projectId || "veil-dev",
  },
);

export const wagmiConfig = createConfig({
  chains: [braga],
  connectors,
  transports: {
    [braga.id]: http(),
  },
  ssr: true,
});
