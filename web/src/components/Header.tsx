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
            className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-[#ddd] bg-white text-[#0b294d] transition-colors hover:border-[#1a9e3a] hover:text-[#1a9e3a]"
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
          className="group inline-flex items-center gap-3 transition-colors"
          aria-label="Veil — home"
        >
          {/* Elaborate lockmark — body + shackle + visible keyhole + accent dot */}
          <svg
            viewBox="0 0 48 48"
            width="56"
            height="56"
            aria-hidden="true"
            className="text-[#0b294d] transition-colors group-hover:text-[#1a9e3a]"
          >
            {/* Shackle */}
            <path
              d="M16 22V14a8 8 0 0 1 16 0v8"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Body */}
            <rect
              x="10"
              y="22"
              width="28"
              height="22"
              rx="4"
              fill="currentColor"
            />
            {/* Keyhole */}
            <circle cx="24" cy="31" r="3" fill="#fff" />
            <rect x="22.5" y="31" width="3" height="7" rx="1.5" fill="#fff" />
            {/* Accent dot — "active" indicator in green */}
            <circle
              cx="38"
              cy="14"
              r="4"
              fill="#1a9e3a"
              className="opacity-0 transition-opacity group-hover:opacity-100"
            />
          </svg>
          <span className="font-[family-name:var(--font-barlow)] text-6xl font-black uppercase leading-none tracking-[-0.02em] text-[#0b294d] transition-colors group-hover:text-[#1a9e3a]">
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
