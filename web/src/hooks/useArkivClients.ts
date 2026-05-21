"use client";

/**
 * useArkivClients — combina wagmi (wallet conectada) con el SDK de Arkiv.
 *
 * Retorna un walletClient de Arkiv configurado con la conexión activa de
 * wagmi (MetaMask, WalletConnect, etc.). Internamente:
 *
 *  1. Tomamos el viem WalletClient de wagmi (que ya sabe firmar con la wallet)
 *  2. Tomamos el provider del connector activo
 *  3. Construimos un createWalletClient de Arkiv con custom(provider) transport
 *
 * Esto da un cliente con métodos como `createEntity`, `extendEntity`, etc.
 * Las firmas las hace MetaMask, no una PK local.
 *
 * Patterns:
 *  - $creator inmutable = wallet address conectada
 *  - Bun runtime evita el bug de Node v24 en updateEntity/extendEntity
 */

import { useMemo, useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { createWalletClient, custom } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import type { ArkivWalletClient } from "@/lib/arkiv";

interface ArkivClients {
  arkivWallet: ArkivWalletClient | null;
  isReady: boolean;
  address: `0x${string}` | undefined;
}

export function useArkivClients(): ArkivClients {
  const { address, connector, isConnected } = useAccount();
  const { data: viemWallet } = useWalletClient({ chainId: braga.id });
  const [provider, setProvider] = useState<unknown>(null);

  // Recuperar el provider EIP-1193 del connector activo (MetaMask, WC, etc.)
  useEffect(() => {
    let cancelled = false;
    if (!connector) {
      setProvider(null);
      return;
    }
    connector.getProvider().then((p) => {
      if (!cancelled) setProvider(p);
    });
    return () => {
      cancelled = true;
    };
  }, [connector]);

  const arkivWallet = useMemo<ArkivWalletClient | null>(() => {
    if (!isConnected || !address || !provider || !viemWallet) return null;

    // viem `custom()` transport envuelve el EIP-1193 provider y delega
    // las firmas a la wallet del usuario. Sin PK local, sin riesgo.
    return createWalletClient({
      chain: braga,
      account: address,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transport: custom(provider as any),
    });
  }, [isConnected, address, provider, viemWallet]);

  return {
    arkivWallet,
    isReady: Boolean(arkivWallet),
    address,
  };
}
