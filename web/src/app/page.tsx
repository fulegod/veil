"use client";

import { useAccount } from "wagmi";

import { Header } from "@/components/Header";
import { useLanguage } from "@/components/LanguageProvider";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col flex-1 bg-[#f4f7f9]">
      <Header />

      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="max-w-2xl">
          <h1 className="font-[family-name:var(--font-barlow)] text-6xl font-black tracking-tight text-[#0b294d] sm:text-7xl uppercase">
            {t("home.titleA")}
            <br />
            <span className="text-[#0099ff]">{t("home.titleB")}</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-[#222] leading-relaxed">
            {t("home.subtitle")}
          </p>

          <p className="mt-4 max-w-xl text-sm text-[#666]">{t("home.note")}</p>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            {isConnected ? (
              <a
                href="/capsule/new"
                className="inline-flex h-12 items-center justify-center rounded-[6px] bg-[#0b294d] px-6 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#0099ff]"
              >
                {t("home.ctaCreate")}
              </a>
            ) : (
              <div className="text-sm text-[#666]">
                {t("common.connectFirst")}
              </div>
            )}
            <a
              href="/capsules"
              className="inline-flex h-12 items-center justify-center rounded-[6px] border-2 border-[#0b294d] bg-white px-6 text-sm font-bold uppercase tracking-wider text-[#0b294d] transition-colors hover:bg-[#0b294d] hover:text-white"
            >
              {t("home.ctaBrowse")}
            </a>
          </div>

          {isConnected && address && (
            <p className="mt-8 font-[family-name:var(--font-geist-mono)] text-xs text-[#666]">
              {t("common.connectedAs")}: {address}
            </p>
          )}
        </div>
      </main>

      <footer className="bg-[#1a1f2e] px-7 py-6 text-xs text-white/60">
        <span>{t("home.footer")}</span>
      </footer>
    </div>
  );
}
