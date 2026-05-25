"use client";

/**
 * BragaOnboarding — 3-step onboarding card for the Braga testnet.
 *
 * Used in two places:
 *  - As a banner inside /capsule/new and /inheritance/new when the connected
 *    wallet has zero balance (or no wallet is connected at all).
 *  - As the body of the dedicated /setup page.
 *
 * Step 1: add Braga to MetaMask via `wallet_addEthereumChain` (one click).
 * Step 2: open the faucet in a new tab and request GLM testnet tokens.
 * Step 3: confirm balance > 0 and link them to the create flow.
 */

import { useAccount, useBalance, useChainId, useSwitchChain } from "wagmi";

import { useLanguage } from "./LanguageProvider";

// Mirror of @arkiv-network/sdk/chains.braga — kept here so we can pass it to
// wallet_addEthereumChain without needing to import the full chain object.
const BRAGA = {
  chainIdHex: "0xDFFA2CECE", // 60138453102 in hex
  chainIdDecimal: 60138453102,
  chainName: "Braga Arkiv Testnet",
  nativeCurrency: { name: "Golem", symbol: "GLM", decimals: 18 },
  rpcUrls: ["https://braga.hoodi.arkiv.network/rpc"],
  blockExplorerUrls: ["https://explorer.braga.hoodi.arkiv.network"],
  faucetUrl: "https://braga.hoodi.arkiv.network/faucet/",
} as const;

interface BragaOnboardingProps {
  /** Compact mode for inline banners; full mode for the /setup page. */
  variant?: "compact" | "full";
}

export function BragaOnboarding({ variant = "compact" }: BragaOnboardingProps) {
  const { t } = useLanguage();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({
    address,
    chainId: BRAGA.chainIdDecimal,
  });

  const isOnBraga = chainId === BRAGA.chainIdDecimal;
  const hasBalance = balance ? balance.value > BigInt(0) : false;
  const balanceDisplay = balance
    ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}`
    : "0 GLM";

  async function addBragaToWallet() {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eth = (window as any).ethereum;
    if (!eth) {
      alert(
        "MetaMask (or another EIP-1193 wallet) not detected. Install MetaMask first.",
      );
      return;
    }
    try {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${BRAGA.chainIdDecimal.toString(16)}`,
            chainName: BRAGA.chainName,
            nativeCurrency: BRAGA.nativeCurrency,
            rpcUrls: BRAGA.rpcUrls,
            blockExplorerUrls: BRAGA.blockExplorerUrls,
          },
        ],
      });
      // After add, try a wagmi switch too (in case MetaMask already had it).
      if (switchChain) switchChain({ chainId: BRAGA.chainIdDecimal });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <section
      className={`border-2 border-black bg-white ${
        variant === "full" ? "p-6 md:p-10" : "p-4 md:p-5"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-black pb-2">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
          [{t("setup.tag")}]
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
          {t("setup.subtag")}
        </p>
      </div>

      {variant === "full" && (
        <>
          <h1 className="mt-4 text-3xl uppercase tracking-tighter md:text-5xl">
            {t("setup.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-xs leading-snug text-gray-700 text-justify md:text-sm">
            {t("setup.intro")}
          </p>
        </>
      )}

      <ol className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Step 1 — Add network */}
        <Step
          n="01"
          label={t("setup.step1Label")}
          done={isConnected && isOnBraga}
        >
          <p className="text-xs text-gray-700 lowercase">
            {t("setup.step1Body")}
          </p>
          <button
            type="button"
            onClick={addBragaToWallet}
            className="mt-2 inline-block border-2 border-black bg-black px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-[#00e676] hover:bg-[#00e676] hover:text-black"
          >
            [{t("setup.step1Cta")}]
          </button>
          <p className="mt-2 break-all font-mono text-[9px] uppercase tracking-widest text-gray-500">
            chainId {BRAGA.chainIdDecimal}
          </p>
        </Step>

        {/* Step 2 — Faucet */}
        <Step
          n="02"
          label={t("setup.step2Label")}
          done={isConnected && isOnBraga && hasBalance}
        >
          <p className="text-xs text-gray-700 lowercase">
            {t("setup.step2Body")}
          </p>
          <a
            href={BRAGA.faucetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block border-2 border-black bg-black px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-[#00e676] hover:bg-[#00e676] hover:text-black"
          >
            [{t("setup.step2Cta")} ↗]
          </a>
          <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-gray-500">
            {address
              ? `${address.slice(0, 6)}…${address.slice(-4)}`
              : "connect wallet first"}
          </p>
        </Step>

        {/* Step 3 — Verify balance */}
        <Step
          n="03"
          label={t("setup.step3Label")}
          done={isConnected && isOnBraga && hasBalance}
        >
          <p className="text-xs text-gray-700 lowercase">
            {t("setup.step3Body")}
          </p>
          <div className="mt-2 border-2 border-black bg-white px-3 py-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
              {t("setup.balanceLabel")}
            </p>
            <p
              className={`font-mono text-base font-bold tabular-nums ${
                hasBalance ? "text-black" : "text-gray-400"
              }`}
            >
              {isConnected && isOnBraga ? balanceDisplay : "—"}
            </p>
          </div>
          {hasBalance && (
            <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
              ✓ {t("setup.readyToSeal")}
            </p>
          )}
        </Step>
      </ol>

      {variant === "full" && (
        <p className="mt-6 max-w-2xl border-l-4 border-[#00e676] bg-[#00e676]/10 px-3 py-2 text-xs leading-snug text-black md:text-sm">
          {t("setup.gasNote")}
        </p>
      )}
    </section>
  );
}

function Step({
  n,
  label,
  done,
  children,
}: {
  n: string;
  label: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <li
      className={`flex flex-col gap-1.5 border-2 p-3 ${
        done ? "border-[#00e676] bg-[#00e676]/10" : "border-black bg-white"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
          [{n}]
        </span>
        {done && (
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
            ✓
          </span>
        )}
      </div>
      <p className="font-mono text-sm font-bold uppercase tracking-tight text-black">
        {label}
      </p>
      {children}
    </li>
  );
}
