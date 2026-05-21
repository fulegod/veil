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
    <div className="flex flex-col flex-1 bg-white text-black">
      <Header />
      <div className="mx-auto w-full max-w-[1280px] flex flex-col gap-6 p-4 md:p-8">
        <section className="relative border-2 border-black bg-white p-6 md:p-12">
          <div className="absolute top-0 left-0 bg-black px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
            [§FEED — PUBLIC CAPSULES]
          </div>

          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-black pb-4">
            <h1 className="text-3xl uppercase tracking-tighter md:text-5xl">
              {t("list.title")}
            </h1>
            <Link
              href="/capsule/new"
              className="border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0_rgba(0,0,0,1)] hover:bg-[#00e676]"
            >
              [{t("list.newCapsule")}]
            </Link>
          </div>

          {load.kind === "loading" && (
            <p className="mt-6 font-mono text-sm text-gray-500">
              [{t("common.loading")}]
            </p>
          )}

          {load.kind === "error" && (
            <div className="mt-6 border-2 border-black bg-white px-3 py-2 font-mono text-xs shadow-[3px_3px_0_rgba(0,0,0,1)]">
              <span className="bg-black px-1 text-white">[ERROR]</span>{" "}
              {t("list.loadError")} {load.message}
            </div>
          )}

          {load.kind === "loaded" && load.capsules.length === 0 && (
            <div className="mt-6 border-2 border-dashed border-black bg-white p-8 text-center">
              <p className="font-mono text-sm lowercase text-gray-700">
                {t("list.empty")}
              </p>
              <Link
                href="/capsule/new"
                className="mt-3 inline-block border-2 border-black bg-black px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-[3px_3px_0_rgba(0,0,0,1)] hover:bg-[#00e676] hover:text-black"
              >
                [{t("list.emptyCta")}]
              </Link>
            </div>
          )}

          {load.kind === "loaded" && load.capsules.length > 0 && (
            <ul className="mt-6 grid grid-cols-1 gap-0 border-2 border-black">
              {load.capsules.map((c, i) => (
                <CapsuleRow
                  key={c.entityKey}
                  capsule={c}
                  now={now}
                  borderTop={i > 0}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function CapsuleRow({
  capsule,
  now,
  borderTop,
}: {
  capsule: CapsuleSummary;
  now: number;
  borderTop: boolean;
}) {
  const { t } = useLanguage();
  const isUnlocked = now >= capsule.unlockAt;
  const remaining = Math.max(0, capsule.unlockAt - now);
  const remainingLabel = formatRemaining(remaining);

  return (
    <li className={borderTop ? "border-t-2 border-black" : ""}>
      <Link
        href={`/capsule/${capsule.entityKey}`}
        className="grid grid-cols-12 gap-3 bg-white p-4 transition-colors hover:bg-[#00e676]"
      >
        <div className="col-span-12 md:col-span-1 flex items-center">
          <span
            className={`inline-block h-3 w-3 ${
              isUnlocked ? "bg-[#00e676] border-2 border-black" : "bg-black"
            }`}
            aria-hidden
          />
        </div>
        <div className="col-span-12 md:col-span-7">
          <h2 className="text-lg uppercase tracking-tight md:text-xl">
            {capsule.title || t("view.untitled")}
          </h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-gray-700">
            {t("list.by")} {capsule.creator.slice(0, 6)}…
            {capsule.creator.slice(-4)}
          </p>
        </div>
        <div className="col-span-12 md:col-span-4 md:text-right">
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
            [{isUnlocked ? t("list.unlocked") : t("list.unlocksIn")}]
          </div>
          <div className="font-mono text-sm font-bold tabular-nums">
            {isUnlocked
              ? new Date(capsule.unlockAt).toLocaleDateString()
              : remainingLabel}
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
