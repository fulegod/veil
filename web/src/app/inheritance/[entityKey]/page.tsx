"use client";

/**
 * /inheritance/[entityKey] — vault detail view.
 *
 *  - Anyone can see: title, M-of-N config, heartbeat countdown, validator list
 *  - Owner only: "I'm alive — extend heartbeat" button (calls extendEntity)
 *  - Validators: link to /recover if heartbeat has expired
 */

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";

import { EnvelopeGlyph, PersonGlyph } from "@/components/BrutalistIcons";
import { Header } from "@/components/Header";
import { useLanguage } from "@/components/LanguageProvider";
import { useArkivClients } from "@/hooks/useArkivClients";
import {
  getVault,
  getSharesForVault,
  getActionsForVault,
  extendVault,
  type VaultEntity,
  type ShareEntity,
  type ActionEntity,
} from "@/lib/arkiv";
import { ACTION_TYPE } from "@/lib/config";
import {
  formatHeartbeatCountdown,
  HEARTBEAT_PRESETS,
  type HeartbeatPreset,
  DEFAULT_HEARTBEAT,
} from "@/lib/inheritance";
import { explorerEntityUrl } from "@/lib/config";

export default function VaultViewPage({
  params,
}: {
  params: Promise<{ entityKey: string }>;
}) {
  const { entityKey } = use(params);
  const { t } = useLanguage();
  const { address } = useAccount();
  const { arkivWallet, isReady } = useArkivClients();

  const [vault, setVault] = useState<VaultEntity | null>(null);
  const [shares, setShares] = useState<ShareEntity[]>([]);
  const [actions, setActions] = useState<ActionEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [extendBusy, setExtendBusy] = useState(false);
  const [extendMsg, setExtendMsg] = useState<string | null>(null);
  const [extendPreset, setExtendPreset] =
    useState<HeartbeatPreset>(DEFAULT_HEARTBEAT);

  // Refresh "now" every 10s for live countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  // Load vault + shares
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [v, s, a] = await Promise.all([
          getVault(entityKey),
          getSharesForVault(entityKey),
          getActionsForVault(entityKey),
        ]);
        if (!cancelled) {
          setVault(v);
          setShares(s);
          setActions(a);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entityKey]);

  const isOwner =
    !!address && !!vault && address.toLowerCase() === vault.owner.toLowerCase();

  const myValidator =
    !!address &&
    shares.find(
      (s) => s.validatorAddress.toLowerCase() === address.toLowerCase(),
    );

  const expired = !!vault && vault.heartbeatAt > 0 && vault.heartbeatAt <= now;

  function actionLabel(actionType: string): string {
    switch (actionType) {
      case ACTION_TYPE.EMAIL_WARNING:
        return t("inh.viewActionWarning");
      case ACTION_TYPE.EMAIL_DELIVERY:
        return t("inh.viewActionDelivery");
      case ACTION_TYPE.TRANSFER:
        return t("inh.viewActionTransfer");
      case ACTION_TYPE.DOC_DROP:
        return t("inh.viewActionDocDrop");
      default:
        return actionType;
    }
  }

  function formatTriggerAt(ms: number): string {
    if (!ms) return "—";
    try {
      return new Date(ms).toISOString().replace("T", " ").slice(0, 16) + " UTC";
    } catch {
      return String(ms);
    }
  }

  async function handleExtend() {
    if (!arkivWallet || !vault) return;
    setExtendBusy(true);
    setExtendMsg(null);
    try {
      const days = HEARTBEAT_PRESETS[extendPreset].days;
      await extendVault(arkivWallet, vault.entityKey, days * 24 * 3600);
      // optimistic update
      setVault({
        ...vault,
        heartbeatAt: vault.heartbeatAt + days * 24 * 60 * 60 * 1000,
      });
      setExtendMsg(t("inh.viewExtendDone"));
    } catch (err) {
      setExtendMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setExtendBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 bg-white text-black">
        <Header />
        <div className="mx-auto w-full max-w-[1280px] p-8 font-mono text-xs uppercase tracking-widest text-gray-500">
          {t("common.loading")}
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
            {t("common.notFoundVault")}
          </p>
          <Link
            href="/inheritance"
            className="mt-4 inline-block border-2 border-black bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-[#00e676]"
          >
            {t("common.back")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white text-black">
      <Header />
      <div className="mx-auto w-full max-w-[1280px] flex flex-col gap-6 p-4 md:p-8">
        <section className="border-2 border-black bg-white p-6 md:p-12 relative">
          <div className="absolute top-0 left-0 bg-black text-white px-2 py-1 text-[10px] uppercase font-bold tracking-widest">
            [{t("sec.vault", { short: `${vault.entityKey.slice(0, 10)}…` })}]
          </div>

          <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl uppercase tracking-tighter md:text-5xl">
                {vault.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`border-2 border-black px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                    expired
                      ? "bg-black text-[#00e676]"
                      : "bg-[#00e676] text-black"
                  }`}
                >
                  {expired
                    ? t("inh.viewBadgeRecoverable")
                    : t("inh.viewBadgeAlive")}
                </span>
                {isOwner && (
                  <span className="border-2 border-black bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest">
                    {t("inh.viewBadgeOwner")}
                  </span>
                )}
                {myValidator && (
                  <span className="border-2 border-black bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest">
                    {t("inh.viewBadgeValidator")} #{myValidator.shareIndex}
                  </span>
                )}
                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                  {vault.threshold}-of-{vault.totalShares}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start gap-1 md:items-end">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {expired
                  ? t("inh.viewHeartbeatExpired")
                  : t("inh.viewHeartbeatLabel")}
              </p>
              {!expired && (
                <p className="font-mono text-xl font-bold text-black md:text-2xl">
                  {formatHeartbeatCountdown(vault.heartbeatAt)}
                </p>
              )}
              <a
                href={explorerEntityUrl(vault.entityKey)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] uppercase tracking-widest text-gray-500 underline hover:text-black"
              >
                {t("common.viewOnBraga")}
              </a>
            </div>
          </div>

          {/* Concept banner photo — matches the vault state */}
          <figure className="mt-8 border-2 border-black bg-black p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                expired ? "/story/07-quorum.webp" : "/story/06-heartbeat.webp"
              }
              alt={
                expired
                  ? "Five wax-sealed envelopes, three opened with brass keys — editorial woodcut"
                  : "Hourglass turned by a hand against a cardiogram waveform — editorial woodcut"
              }
              className="block w-full h-auto max-h-[320px] object-cover"
            />
            <figcaption className="bg-black p-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
              [§{" "}
              {(expired
                ? t("inh.bannerExpiredCaption")
                : t("inh.bannerAliveCaption")
              ).toUpperCase()}
              ]
            </figcaption>
          </figure>

          {/* Contextual narrative banner — explains the current state in plain language */}
          <div
            className={`mt-8 border-2 p-4 md:p-5 ${
              expired
                ? "border-[#00e676] bg-black text-white"
                : "border-black bg-[#00e676] text-black"
            }`}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest">
              [{expired ? t("sec.statusRecoveryOpen") : t("sec.statusAlive")}]
            </p>
            <h2 className="mt-1 font-mono text-base font-bold uppercase tracking-tight md:text-lg">
              {expired
                ? t("inh.viewBannerExpiredTitle")
                : t("inh.viewBannerAliveTitle")}
            </h2>
            <p className="mt-2 text-xs leading-snug md:text-sm">
              {expired
                ? t("inh.viewBannerExpiredBody")
                : t("inh.viewBannerAliveBody")}
            </p>
          </div>

          {/* Owner heartbeat button */}
          {isOwner && !expired && (
            <div className="mt-8 border-2 border-black bg-white p-4">
              <p className="font-mono text-xs uppercase tracking-widest text-black">
                {t("inh.fieldHeartbeat")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {(Object.keys(HEARTBEAT_PRESETS) as HeartbeatPreset[]).map(
                  (k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setExtendPreset(k)}
                      className={`border-2 border-black px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest ${
                        extendPreset === k
                          ? "bg-black text-[#00e676]"
                          : "bg-white text-black hover:bg-gray-100"
                      }`}
                    >
                      +{HEARTBEAT_PRESETS[k].label}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={handleExtend}
                  disabled={!isReady || extendBusy}
                  className="border-2 border-black bg-[#00e676] px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest text-black hover:bg-black hover:text-[#00e676] disabled:opacity-50"
                >
                  {extendBusy
                    ? "…"
                    : `[${t("inh.viewExtendCta").toUpperCase()}]`}
                </button>
              </div>
              {extendMsg && (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-gray-700">
                  {extendMsg}
                </p>
              )}
            </div>
          )}

          {/* Recovery CTA if expired and viewer is a validator */}
          {expired && myValidator && (
            <Link
              href={`/inheritance/${vault.entityKey}/recover`}
              className="mt-8 inline-block border-2 border-black bg-black px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-[#00e676] hover:bg-[#00e676] hover:text-black"
            >
              {t("inh.viewRecoverCta")}
            </Link>
          )}

          {/* Validator list */}
          <div className="mt-10">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest">
              <span className="bg-[#00e676] px-2 py-0.5 text-black">
                {t("inh.viewSharesHeader")}
              </span>
            </h2>
            <p className="mt-2 max-w-2xl text-xs leading-snug text-gray-600 lowercase text-justify md:text-sm">
              {t("inh.viewSharesHint")}
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {shares.map((s) => (
                <li
                  key={s.entityKey}
                  className="border-2 border-black bg-white p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {t("common.share")} #{s.shareIndex}
                    </p>
                    <EnvelopeGlyph size={18} className="text-[#00e676]" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <PersonGlyph size={28} className="shrink-0 text-black" />
                    <p className="break-all font-mono text-xs text-black">
                      {s.validatorAddress}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Scheduled Actions — off-chain dispatchers attached to this vault */}
          <div className="mt-10">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest">
              <span className="bg-[#00e676] px-2 py-0.5 text-black">
                {t("inh.viewActionsHeader")}
              </span>
            </h2>
            <p className="mt-2 max-w-2xl text-xs leading-snug text-gray-600 lowercase text-justify md:text-sm">
              {t("inh.viewActionsHint")}
            </p>
            {actions.length === 0 ? (
              <p className="mt-3 border-2 border-dashed border-black bg-white p-3 font-mono text-[10px] uppercase tracking-widest text-gray-500">
                {t("inh.viewActionsEmpty")}
              </p>
            ) : (
              <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                {actions
                  .slice()
                  .sort((a, b) => a.triggerAt - b.triggerAt)
                  .map((a) => {
                    const fired = a.notifiedAt > 0;
                    return (
                      <li
                        key={a.entityKey}
                        className="border-2 border-black bg-white p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            {actionLabel(a.actionType)}
                          </p>
                          <span
                            className={`border-2 border-black px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                              fired
                                ? "bg-black text-[#00e676]"
                                : "bg-[#00e676] text-black"
                            }`}
                          >
                            {fired
                              ? t("inh.viewActionStatusFired")
                              : t("inh.viewActionStatusPending")}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-[80px_1fr] gap-1 font-mono text-[11px]">
                          <span className="text-gray-500 uppercase tracking-widest text-[10px]">
                            {t("inh.viewActionFires")}
                          </span>
                          <span className="text-black">
                            {formatTriggerAt(a.triggerAt)}
                          </span>
                          <span className="text-gray-500 uppercase tracking-widest text-[10px]">
                            {t("inh.viewActionDest")}
                          </span>
                          <span className="break-all text-black">
                            {a.destination}
                          </span>
                        </div>
                        {a.message && (
                          <p className="mt-2 border-l-2 border-[#00e676] bg-gray-50 p-2 text-[11px] leading-snug text-black">
                            “{a.message}”
                          </p>
                        )}
                        {a.capsuleKey && (
                          <Link
                            href={`/capsule/${a.capsuleKey}`}
                            className="mt-2 inline-block border-2 border-black bg-black px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676] hover:bg-[#00e676] hover:text-black"
                          >
                            [{t("common.sealedFile")} → /capsule/
                            {a.capsuleKey.slice(0, 8)}…]
                          </Link>
                        )}
                        <a
                          href={explorerEntityUrl(a.entityKey)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 mt-2 inline-block font-mono text-[10px] uppercase tracking-widest text-gray-500 underline hover:text-black"
                        >
                          {a.entityKey.slice(0, 10)}… {t("common.toBraga")}
                        </a>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
