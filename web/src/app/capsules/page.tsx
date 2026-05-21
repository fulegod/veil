"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Header } from "@/components/Header";
import { useLanguage } from "@/components/LanguageProvider";
import { listCapsules } from "@/lib/arkiv";

interface CapsuleSummary {
  entityKey: string;
  title: string;
  creator: string;
  unlockAt: number;
  isPublic: boolean;
}

type LoadState =
  | { kind: "loading" }
  | { kind: "loaded"; capsules: CapsuleSummary[] }
  | { kind: "error"; message: string };

export default function CapsulesPage() {
  const { t } = useLanguage();
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await listCapsules({ limit: 50 });
        if (cancelled) return;

        const items: CapsuleSummary[] = result.entities
          .map(
            (e: {
              key: string;
              attributes: { key: string; value: string | number }[];
              creator?: string;
            }) => {
              const attrs = Object.fromEntries(
                e.attributes.map((a) => [a.key, a.value]),
              );
              return {
                entityKey: e.key,
                title: String(attrs.title ?? ""),
                creator: e.creator ?? "",
                unlockAt: Number(attrs.unlock_at) || 0,
                isPublic: Number(attrs.is_public) === 1,
              };
            },
          )
          .filter((c: CapsuleSummary) => c.isPublic)
          .sort(
            (a: CapsuleSummary, b: CapsuleSummary) => b.unlockAt - a.unlockAt,
          );

        setLoad({ kind: "loaded", capsules: items });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setLoad({ kind: "error", message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col flex-1 bg-[#f4f7f9]">
      <Header />

      <main className="flex flex-1 justify-center px-6 py-16">
        <div className="w-full max-w-3xl space-y-8">
          <div className="flex items-baseline justify-between">
            <h1 className="font-[family-name:var(--font-barlow)] text-4xl font-black uppercase tracking-tight text-[#0b294d]">
              {t("list.title")}
            </h1>
            <Link
              href="/capsule/new"
              className="text-sm font-bold uppercase tracking-wider text-[#0099ff] hover:text-[#0b294d]"
            >
              {t("list.newCapsule")}
            </Link>
          </div>

          {load.kind === "loading" && (
            <div className="text-[#666]">{t("common.loading")}</div>
          )}

          {load.kind === "error" && (
            <div className="rounded-[8px] border border-[#e53e3e]/30 bg-[#fdecea] px-4 py-3 text-sm text-[#9b2c2c]">
              {t("list.loadError")} {load.message}
            </div>
          )}

          {load.kind === "loaded" && load.capsules.length === 0 && (
            <div className="rounded-[14px] bg-white px-6 py-12 text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <p className="text-[#666]">{t("list.empty")}</p>
              <Link
                href="/capsule/new"
                className="mt-3 inline-block text-sm font-bold uppercase tracking-wider text-[#0099ff] hover:text-[#0b294d]"
              >
                {t("list.emptyCta")}
              </Link>
            </div>
          )}

          {load.kind === "loaded" && load.capsules.length > 0 && (
            <ul className="space-y-3">
              {load.capsules.map((c) => (
                <CapsuleRow key={c.entityKey} capsule={c} now={now} />
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

function CapsuleRow({
  capsule,
  now,
}: {
  capsule: CapsuleSummary;
  now: number;
}) {
  const { t } = useLanguage();
  const isUnlocked = now >= capsule.unlockAt;
  const remaining = Math.max(0, capsule.unlockAt - now);
  const remainingLabel = formatRemaining(remaining);

  return (
    <li>
      <Link
        href={`/capsule/${capsule.entityKey}`}
        className="block rounded-[14px] bg-white px-5 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  isUnlocked ? "bg-[#28a745]" : "bg-[#d69e2e]"
                }`}
                aria-hidden
              />
              <h2 className="truncate font-[family-name:var(--font-barlow)] text-xl font-bold uppercase tracking-tight text-[#0b294d]">
                {capsule.title || t("view.untitled")}
              </h2>
            </div>
            <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-xs text-[#666]">
              {t("list.by")} {capsule.creator.slice(0, 6)}…
              {capsule.creator.slice(-4)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-wider text-[#666]">
              {isUnlocked ? t("list.unlocked") : t("list.unlocksIn")}
            </div>
            <div className="font-[family-name:var(--font-geist-mono)] text-sm font-bold text-[#0b294d]">
              {isUnlocked
                ? new Date(capsule.unlockAt).toLocaleDateString()
                : remainingLabel}
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}

function formatRemaining(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
