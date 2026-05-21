"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected, address } = useAccount();

  return (
    <div className="flex flex-col flex-1 bg-black">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-900">
        <div className="font-mono text-sm tracking-wider text-zinc-400">
          VEIL
        </div>
        <ConnectButton />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
            Encrypted time capsules.
            <br />
            <span className="text-zinc-500">Trustless.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-zinc-400">
            Write something today. Pick a future date. The payload is encrypted
            against a drand round that doesn&apos;t exist yet — nobody can read
            it before the time you chose, and nobody can stop the reveal.
          </p>

          <p className="mt-4 max-w-xl text-sm text-zinc-500">
            Stored on Arkiv (Braga). Author attribution is immutable.
          </p>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            {isConnected ? (
              <a
                href="/capsule/new"
                className="inline-flex h-11 items-center justify-center rounded-md bg-violet-600 px-5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
              >
                Create a capsule
              </a>
            ) : (
              <div className="text-sm text-zinc-500">
                Connect your wallet to create capsules.
              </div>
            )}
            <a
              href="/capsules"
              className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-800 px-5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
            >
              Browse public capsules
            </a>
          </div>

          {isConnected && address && (
            <p className="mt-8 font-mono text-xs text-zinc-600">
              connected: {address}
            </p>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-900 px-6 py-4 text-xs text-zinc-600">
        <span>Arkiv × ETHNS Builder Challenge — Privacy track</span>
      </footer>
    </div>
  );
}
