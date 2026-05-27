"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "./LanguageProvider";
import { DEMO_VIDEO_URL } from "@/lib/config";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const isHome = pathname === "/";

  // Fake "today's edition" issue number for that newspaper feel
  const issue = String(Math.floor((Date.now() / 86_400_000) % 999)).padStart(
    3,
    "0",
  );

  // Section nav — newspaper-style sections. Active state if route belongs to it.
  const sections = [
    {
      label: t("nav.capsules"),
      href: "/capsules",
      // CAPSULES section owns: /capsules, /capsule/*
      active: pathname.startsWith("/capsule"),
    },
    {
      label: t("nav.inheritance"),
      href: "/inheritance",
      active: pathname.startsWith("/inheritance"),
    },
    {
      label: t("nav.cases"),
      href: "/case-files",
      active: pathname.startsWith("/case-files"),
    },
    {
      label: t("nav.setup"),
      href: "/setup",
      active: pathname.startsWith("/setup"),
    },
  ];

  return (
    <header className="border-b-2 border-black bg-white">
      {/* Masthead row */}
      <div className="px-4 py-3 md:px-8 md:py-4">
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
                  {t("head.tagline", { issue })}
                </span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {DEMO_VIDEO_URL ? (
              <a
                href={DEMO_VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border-2 border-black bg-[#00e676] px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black shadow-[3px_3px_0_rgba(0,0,0,1)] transition-colors hover:bg-black hover:text-[#00e676]"
              >
                <span>▶</span>
                <span>{t("head.demoLive")}</span>
              </a>
            ) : (
              <span
                aria-disabled="true"
                title={t("head.demoSoonTooltip")}
                className="inline-flex cursor-not-allowed items-center gap-1.5 border-2 border-black bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-gray-500 opacity-70"
              >
                <span>▶</span>
                <span>{t("head.demoSoon")}</span>
              </span>
            )}
            <LanguageToggle />
            <ConnectButton />
          </div>
        </div>
      </div>

      {/* Section nav row — newspaper section bar */}
      <nav aria-label="Sections" className="border-t-2 border-black bg-white">
        <div className="mx-auto flex max-w-[1280px] gap-0 overflow-x-auto px-4 md:px-8">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              aria-current={s.active ? "page" : undefined}
              className={`flex items-center gap-2 whitespace-nowrap border-r-2 border-black px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-widest transition-colors first:border-l-2 hover:bg-[#00e676]/10 md:px-6 md:py-3 md:text-sm ${
                s.active ? "bg-black text-[#00e676]" : "bg-white text-black"
              }`}
            >
              <span className="text-[#00e676]">§</span>
              <span>{s.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
