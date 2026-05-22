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
            className="group inline-flex items-center gap-3"
            aria-label="Veil — home"
          >
            {/* Brandmark — mirrors Arkiv [A] but in Veil green with [V] */}
            <svg
              viewBox="0 0 64 64"
              className="h-12 w-12 shrink-0 md:h-14 md:w-14"
              aria-hidden
            >
              <rect width="64" height="64" rx="10" ry="10" fill="#00e676" />
              <path
                d="M 5 14 L 15 14 L 15 19 L 10 19 L 10 45 L 15 45 L 15 50 L 5 50 Z"
                fill="#ffffff"
              />
              <path
                d="M 21 14 L 27 14 L 32 37 L 37 14 L 43 14 L 35 50 L 29 50 Z"
                fill="#ffffff"
              />
              <path
                d="M 59 14 L 49 14 L 49 19 L 54 19 L 54 45 L 49 45 L 49 50 L 59 50 Z"
                fill="#ffffff"
              />
            </svg>
            <span className="inline-flex flex-col gap-0.5">
              <span className="font-mono text-3xl font-bold uppercase leading-none tracking-tighter text-black md:text-4xl">
                VEIL
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                SEAL IT. PROVE IT. ISSUE NO. {issue}
              </span>
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
