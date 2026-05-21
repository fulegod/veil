"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { LanguageToggle } from "./LanguageToggle";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  return (
    <header className="flex items-center justify-between gap-4 px-7 py-5 bg-white border-b border-[#eee] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-4">
        {!isHome && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-[#ddd] bg-white text-[#0b294d] transition-colors hover:border-[#0099ff] hover:text-[#0099ff]"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                fill="currentColor"
                d="M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41Z"
              />
            </svg>
          </button>
        )}
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 transition-colors"
          aria-label="Veil — home"
        >
          <svg
            viewBox="0 0 24 24"
            width="44"
            height="44"
            aria-hidden="true"
            className="text-[#0b294d] group-hover:text-[#0099ff] transition-colors"
          >
            <path
              fill="currentColor"
              d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Zm3 4a1.5 1.5 0 0 1 .75 2.8V19a.75.75 0 1 1-1.5 0v-2.2A1.5 1.5 0 0 1 12 14Z"
            />
          </svg>
          <span className="font-[family-name:var(--font-barlow)] text-5xl font-black uppercase tracking-tight leading-none text-[#0b294d] group-hover:text-[#0099ff] transition-colors">
            Veil
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <ConnectButton />
      </div>
    </header>
  );
}
