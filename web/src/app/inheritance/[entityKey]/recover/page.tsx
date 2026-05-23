"use client";

/**
 * /inheritance/[entityKey]/recover — combine M shares to reconstruct the secret.
 *
 * MVP threat model: shares are stored in Arkiv as public payloads (queryable
 * by anyone). Recovery requires combining M of N — that's the cryptographic
 * threshold. v2 would encrypt each share with the validator's pubkey (ECIES)
 * so even reading the share requires the validator's signature.
 *
 * Flow:
 *  1. Page loads vault + all share entities
 *  2. Each share is rendered with a "Use this share" checkbox
 *  3. When >= M shares are selected, "Combine" button activates
 *  4. Click combine → Shamir reconstruct → display plaintext
 */

import { use, useEffect, useState } from "react";
import Link from "next/link";

import {
  EnvelopeGlyph,
  KeyGlyph,
  PersonGlyph,
} from "@/components/BrutalistIcons";
import { Header } from "@/components/Header";
import { useLanguage } from "@/components/LanguageProvider";
import {
  getVault,
  getSharesForVault,
  type VaultEntity,
  type ShareEntity,
} from "@/lib/arkiv";
import { combineShares } from "@/lib/inheritance";
import { explorerEntityUrl } from "@/lib/config";

export default function RecoverPage({
  params,
}: {
  params: Promise<{ entityKey: string }>;
}) {
  const { entityKey } = use(params);
  const { t } = useLanguage();

  const [vault, setVault] = useState<VaultEntity | null>(null);
  const [shares, setShares] = useState<ShareEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [recovered, setRecovered] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [v, s] = await Promise.all([
          getVault(entityKey),
          getSharesForVault(entityKey),
        ]);
        if (!cancelled) {
          setVault(v);
          setShares(s);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entityKey]);

  function toggleShare(idx: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
    setRecovered(null);
    setError(null);
  }

  function handleCombine() {
    if (!vault) return;
    const picked = shares.filter((s) => selected.has(s.shareIndex));
    if (picked.length < vault.threshold) {
      setError(
        t("inh.recoverInsufficient", {
          m: vault.threshold,
          have: picked.length,
        }),
      );
      return;
    }
    try {
      const result = combineShares(picked.map((s) => s.sharePayload));
      setRecovered(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 bg-white text-black">
        <Header />
        <div className="mx-auto w-full max-w-[1280px] p-8 font-mono text-xs uppercase tracking-widest text-gray-500">
          loading…
        </div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="flex flex-col flex-1 bg-white text-black">
        <Header />
        <div className="mx-auto w-full max-w-[1280px] p-8">
          <p className="border-2 border-black bg-white p-3 font-mono text-xs uppercase tracking-widest">
            Vault not found.
          </p>
        </div>
      </div>
    );
  }

  const enoughSelected = selected.size >= vault.threshold;

  return (
    <div className="flex flex-col flex-1 bg-white text-black">
      <Header />
      <div className="mx-auto w-full max-w-[1280px] flex flex-col gap-6 p-4 md:p-8">
        <section className="border-2 border-black bg-white p-6 md:p-12 relative">
          <div className="absolute top-0 left-0 bg-black text-white px-2 py-1 text-[10px] uppercase font-bold tracking-widest">
            [§INH — RECOVER]
          </div>

          <div className="mt-6">
            <Link
              href={`/inheritance/${vault.entityKey}`}
              className="font-mono text-[10px] uppercase tracking-widest text-gray-600 hover:text-black"
            >
              ← {vault.title}
            </Link>
            <h1 className="mt-2 text-3xl uppercase tracking-tighter md:text-5xl">
              {t("inh.recoverTitle")}
            </h1>
            <p className="mt-3 text-xs leading-snug text-gray-700 md:text-sm">
              {t("inh.recoverIntro", {
                m: vault.threshold,
                n: vault.totalShares,
              })}
            </p>
          </div>

          {/* Concept banner — the quorum moment, visualized */}
          <figure className="mt-6 border-2 border-black bg-black p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/story/07-quorum.webp"
              alt="Five wax-sealed envelopes, three opened with brass keys, recovered parchment above — editorial woodcut"
              className="block w-full h-auto max-h-[320px] object-cover"
            />
            <figcaption className="bg-black p-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
              [§ {t("inh.bannerRecoverCaption").toUpperCase()}]
            </figcaption>
          </figure>

          {/* Share picker */}
          <div className="mt-8">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest">
              <span className="bg-[#00e676] px-2 py-0.5 text-black">
                {t("inh.viewSharesHeader")} — {selected.size}/{vault.threshold}{" "}
                selected
              </span>
            </h2>

            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {shares.map((s) => {
                const isSelected = selected.has(s.shareIndex);
                return (
                  <li key={s.entityKey}>
                    <label
                      className={`block cursor-pointer border-2 border-black p-3 ${
                        isSelected
                          ? "bg-[#00e676]"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleShare(s.shareIndex)}
                          className="mt-1 h-4 w-4 border-2 border-black accent-black"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
                              SHARE #{s.shareIndex}
                            </p>
                            {isSelected ? (
                              <KeyGlyph size={18} className="text-black" />
                            ) : (
                              <EnvelopeGlyph
                                size={18}
                                className="text-[#00e676]"
                              />
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <PersonGlyph
                              size={24}
                              className="shrink-0 text-black"
                            />
                            <p className="break-all font-mono text-xs text-black">
                              {s.validatorAddress}
                            </p>
                          </div>
                          <a
                            href={explorerEntityUrl(s.entityKey)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 inline-block font-mono text-[9px] uppercase tracking-widest text-gray-600 underline hover:text-black"
                          >
                            view on Braga →
                          </a>
                        </div>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Combine button */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleCombine}
              disabled={!enoughSelected}
              className="w-fit border-2 border-black bg-black px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-[#00e676] hover:bg-[#00e676] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              [{t("inh.recoverCombineCta").toUpperCase()}]
            </button>

            {error && (
              <div className="border-2 border-black bg-white px-3 py-2 font-mono text-xs uppercase tracking-widest text-red-700">
                {error}
              </div>
            )}

            {recovered !== null && (
              <div className="border-2 border-black bg-white p-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
                  {t("inh.recoverSecret")}
                </p>
                <pre className="mt-3 whitespace-pre-wrap break-all font-mono text-sm text-black">
                  {recovered}
                </pre>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
