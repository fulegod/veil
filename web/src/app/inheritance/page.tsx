"use client";

/**
 * /inheritance — dashboard. Two sections:
 *  - Vaults you set up (as owner)
 *  - Vaults where you're named as a validator
 *
 * Both queries are project-scoped (PROJECT_ATTRIBUTE) and use the indexed
 * attributes (`validator_address`, `kind`) for efficient lookups.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";

import { Header } from "@/components/Header";
import { useLanguage } from "@/components/LanguageProvider";
import {
  listVaultsForOwner,
  listVaultsForValidator,
  getVault,
} from "@/lib/arkiv";
import { formatHeartbeatCountdown } from "@/lib/inheritance";

interface VaultRow {
  entityKey: string;
  title: string;
  heartbeatAt: number;
  threshold: number;
  totalShares: number;
}

export default function InheritanceDashboardPage() {
  const { t } = useLanguage();
  const { address, isConnected } = useAccount();

  const [mine, setMine] = useState<VaultRow[]>([]);
  const [asValidator, setAsValidator] = useState<VaultRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        // Vaults I own
        const ownerEntities = await listVaultsForOwner(address);
        const mineRows: VaultRow[] = ownerEntities.map(
          (e: {
            key: string;
            attributes: { key: string; value: string | number }[];
          }) => {
            const a = Object.fromEntries(
              e.attributes.map((x) => [x.key, x.value]),
            );
            return {
              entityKey: e.key,
              title: String(a.title ?? ""),
              heartbeatAt: Number(a.heartbeat_at) || 0,
              threshold: Number(a.threshold) || 0,
              totalShares: Number(a.total_shares) || 0,
            };
          },
        );

        // Vault keys where I'm a validator
        const validatorVaultKeys = await listVaultsForValidator(address);
        const validatorRows: VaultRow[] = [];
        for (const key of validatorVaultKeys) {
          const v = await getVault(key);
          if (v) {
            validatorRows.push({
              entityKey: v.entityKey,
              title: v.title,
              heartbeatAt: v.heartbeatAt,
              threshold: v.threshold,
              totalShares: v.totalShares,
            });
          }
        }

        if (!cancelled) {
          setMine(mineRows);
          setAsValidator(validatorRows);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address]);

  return (
    <div className="flex flex-col flex-1 bg-white text-black">
      <Header />
      <div className="mx-auto w-full max-w-[1280px] flex flex-col gap-6 p-4 md:p-8">
        <section className="border-2 border-black bg-white p-6 md:p-12 relative">
          <div className="absolute top-0 left-0 bg-black text-white px-2 py-1 text-[10px] uppercase font-bold tracking-widest">
            [§INH — DASHBOARD]
          </div>

          <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {t("inh.listEyebrow")}
              </p>
              <h1 className="text-3xl uppercase tracking-tighter md:text-5xl">
                {t("inh.listTitle")}
              </h1>
              <p className="mt-2 text-xs text-gray-700 md:text-sm">
                {t("inh.listSubtitle")}
              </p>
            </div>
            <Link
              href="/inheritance/new"
              className="border-2 border-black bg-black px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-[#00e676] hover:bg-[#00e676] hover:text-black w-fit"
            >
              {t("inh.listNewCta")}
            </Link>
          </div>

          {!isConnected && (
            <p className="mt-6 border-2 border-black bg-white p-3 font-mono text-[10px] uppercase tracking-widest text-gray-700">
              {t("inh.errorConnect")}
            </p>
          )}

          {/* Two columns */}
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <VaultColumn
              header={t("inh.listSectionMine")}
              vaults={mine}
              emptyText={t("inh.listEmptyMine")}
              loading={loading}
              role="owner"
              t={t}
            />
            <VaultColumn
              header={t("inh.listSectionValidator")}
              vaults={asValidator}
              emptyText={t("inh.listEmptyValidator")}
              loading={loading}
              role="validator"
              t={t}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function VaultColumn({
  header,
  vaults,
  emptyText,
  loading,
  role,
  t,
}: {
  header: string;
  vaults: VaultRow[];
  emptyText: string;
  loading: boolean;
  role: "owner" | "validator";
  t: (k: never, vars?: Record<string, string | number>) => string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-mono text-sm font-bold uppercase tracking-widest">
        <span className="bg-[#00e676] px-2 py-0.5 text-black">{header}</span>
      </h2>

      {loading ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
          loading…
        </p>
      ) : vaults.length === 0 ? (
        <p className="border-2 border-black bg-white p-3 font-mono text-[10px] uppercase tracking-widest text-gray-600">
          {emptyText}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {vaults.map((v) => {
            const expired = v.heartbeatAt > 0 && v.heartbeatAt <= Date.now();
            return (
              <li key={v.entityKey}>
                <Link
                  href={`/inheritance/${v.entityKey}`}
                  className="block border-2 border-black bg-white p-3 hover:bg-[#00e676]/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-sm font-bold uppercase tracking-tight text-black">
                      {v.title || "(untitled)"}
                    </span>
                    <span
                      className={`shrink-0 border-2 border-black px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                        expired
                          ? "bg-black text-[#00e676]"
                          : "bg-white text-black"
                      }`}
                    >
                      {expired
                        ? // @ts-expect-error t signature is loose for cross-file reuse
                          t("inh.viewBadgeRecoverable")
                        : // @ts-expect-error t signature is loose for cross-file reuse
                          t("inh.viewBadgeAlive")}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-gray-600">
                    {v.threshold}-of-{v.totalShares} ·{" "}
                    {expired
                      ? // @ts-expect-error
                        t("inh.viewHeartbeatExpired")
                      : formatHeartbeatCountdown(v.heartbeatAt)}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
