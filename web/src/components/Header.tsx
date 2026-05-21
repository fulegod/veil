"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { LanguageToggle } from "./LanguageToggle";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  // Fake "today's edition" issue number for that newspaper feel
  const issue = String(Math.floor((Date.now() / 86_400_000) % 999)).padStart(
    3,
    "0",
  );

  return (
    <header className="border-b-2 border-black bg-white px-4 py-3 md:px-8 md:py-4">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {!isHome && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="border-2 border-black bg-white px-2 py-1 font-mono text-xs font-bold uppercase tracking-widest transition-colors hover:bg-black hover:text-[#00e676]"
            >
              [←]
            </button>
          )}
          <Link
            href="/"
            className="group inline-flex flex-col gap-0.5"
            aria-label="Veil — home"
          >
            <span className="font-mono text-3xl font-bold uppercase leading-none tracking-tighter text-black md:text-4xl">
              VEIL
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
              SEAL IT. PROVE IT. ISSUE NO. {issue}
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
