"use client";

/**
 * /inheritance/new — create an Inheritance Vault.
 *
 * Flow:
 *  1. User picks heartbeat preset (3m/6m/1y) and threshold preset (2-of-3/3-of-5/5-of-7)
 *  2. User pastes the secret + N validator addresses
 *  3. We:
 *     a. drand-timelock-encrypt the secret with target = now + heartbeat
 *     b. Shamir-split the secret into N shares
 *     c. createVault(ciphertext) on Arkiv
 *     d. createShare() N times, linked via vault_key
 *  4. Redirect to /inheritance/[vaultKey]
 *
 * Note: the secret is encrypted client-side. The drand timelock prevents
 * anyone (including the validators) from reading it before the heartbeat
 * lapses. The Shamir split ensures M validators must cooperate even after
 * the round publishes.
 */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/Header";
import { InheritanceIntro } from "@/components/InheritanceIntro";
import { useLanguage } from "@/components/LanguageProvider";
import { useArkivClients } from "@/hooks/useArkivClients";
import { encryptForTime } from "@/lib/tlock";
import { createVault, createShare } from "@/lib/arkiv";
import {
  splitSecret,
  shareToHex,
  heartbeatTargetTimestamp,
  HEARTBEAT_PRESETS,
  THRESHOLD_PRESETS,
  DEFAULT_HEARTBEAT,
  type HeartbeatPreset,
} from "@/lib/inheritance";
import type { TKey } from "@/lib/i18n";

type Status =
  | { kind: "idle" }
  | { kind: "encrypting" }
  | { kind: "splitting"; n: number }
  | { kind: "vault" }
  | { kind: "share"; i: number; n: number }
  | { kind: "done"; entityKey: string }
  | {
      kind: "error";
      messageKey?: TKey;
      messageVars?: Record<string, string | number>;
      raw?: string;
    };

const isAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v.trim());

export default function NewInheritancePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { arkivWallet, isReady, address } = useArkivClients();

  const [title, setTitle] = useState("");
  const [secret, setSecret] = useState("");
  const [thresholdIdx, setThresholdIdx] = useState(1); // 3-of-5 default
  const [heartbeat, setHeartbeat] =
    useState<HeartbeatPreset>(DEFAULT_HEARTBEAT);
  const [validators, setValidators] = useState<string[]>(["", "", "", "", ""]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const preset = THRESHOLD_PRESETS[thresholdIdx];

  // Resize validators array when threshold changes
  useEffect(() => {
    setValidators((prev) => {
      if (prev.length === preset.total) return prev;
      const next = [...prev];
      while (next.length < preset.total) next.push("");
      next.length = preset.total;
      return next;
    });
  }, [preset.total]);

  const busy =
    status.kind !== "idle" && status.kind !== "error" && status.kind !== "done";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!isReady || !arkivWallet || !address) {
      setStatus({ kind: "error", messageKey: "inh.errorConnect" });
      return;
    }
    if (!title.trim() || !secret.trim()) {
      setStatus({ kind: "error", messageKey: "inh.errorRequired" });
      return;
    }

    const trimmed = validators.slice(0, preset.total).map((v) => v.trim());
    for (let i = 0; i < trimmed.length; i++) {
      if (!isAddress(trimmed[i])) {
        setStatus({
          kind: "error",
          messageKey: "inh.errorInvalidValidator",
          messageVars: { i: i + 1 },
        });
        return;
      }
    }
    const lower = trimmed.map((v) => v.toLowerCase());
    if (new Set(lower).size !== lower.length) {
      setStatus({ kind: "error", messageKey: "inh.errorDuplicateValidator" });
      return;
    }
    if (lower.includes(address.toLowerCase())) {
      setStatus({ kind: "error", messageKey: "inh.errorSelfValidator" });
      return;
    }

    try {
      const heartbeatAt = heartbeatTargetTimestamp(heartbeat);

      setStatus({ kind: "encrypting" });
      const { ciphertext, round } = await encryptForTime(secret, heartbeatAt);

      setStatus({ kind: "splitting", n: preset.total });
      const shares = splitSecret(secret, preset.threshold, preset.total);

      setStatus({ kind: "vault" });
      const vaultRes = await createVault({
        walletClient: arkivWallet,
        ciphertext,
        unlockRound: round,
        heartbeatAt,
        title: title.trim(),
        threshold: preset.threshold,
        totalShares: preset.total,
      });

      const vaultKey = vaultRes.entityKey;

      for (let i = 0; i < preset.total; i++) {
        setStatus({ kind: "share", i: i + 1, n: preset.total });
        await createShare({
          walletClient: arkivWallet,
          vaultKey,
          shareIndex: i + 1,
          validatorAddress: trimmed[i],
          shareHex: shareToHex(shares[i]),
        });
      }

      setStatus({ kind: "done", entityKey: vaultKey });
      setTimeout(() => router.push(`/inheritance/${vaultKey}`), 1500);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", raw });
    }
  }

  const statusLine = useMemo(() => {
    switch (status.kind) {
      case "encrypting":
        return t("inh.statusEncrypting");
      case "splitting":
        return t("inh.statusSplitting", { n: status.n });
      case "vault":
        return t("inh.statusCreatingVault");
      case "share":
        return t("inh.statusCreatingShare", { i: status.i, n: status.n });
      case "done":
        return t("inh.statusDone");
      default:
        return null;
    }
  }, [status, t]);

  return (
    <div className="flex flex-col flex-1 bg-white text-black">
      <Header />
      <div className="mx-auto w-full max-w-[1280px] flex flex-col gap-6 p-4 md:p-8">
        <InheritanceIntro
          onPickUseCase={(sample) => {
            setTitle(sample);
            // Smooth-scroll to the form so the user sees the title got filled
            if (typeof window !== "undefined") {
              window.scrollBy({ top: 200, behavior: "smooth" });
            }
          }}
        />
        {/* Concept banner — the vault you're about to create, visualized */}
        <figure className="border-2 border-black bg-black p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/story/05-vault.webp"
            alt="Massive vault sealed with chains and a wax sigil — editorial woodcut"
            className="block w-full h-auto max-h-[380px] object-cover"
          />
          <figcaption className="bg-black p-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
            [§ {t("inh.bannerNewCaption").toUpperCase()}]
          </figcaption>
        </figure>
        <section className="border-2 border-black bg-white p-6 md:p-12 relative">
          <div className="absolute top-0 left-0 bg-black text-white px-2 py-1 text-[10px] uppercase font-bold tracking-widest">
            [§INH — NEW VAULT]
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid grid-cols-12 gap-6"
          >
            <div className="col-span-12 md:col-span-8 flex flex-col gap-6">
              <div>
                <h1 className="text-3xl uppercase tracking-tighter md:text-5xl">
                  {t("inh.newTitle")}
                </h1>
                <p className="mt-3 text-xs leading-snug text-gray-700 lowercase text-justify md:text-sm">
                  {t("inh.newIntro")}
                </p>
              </div>

              <Field label={t("inh.fieldTitle")}>
                <BrutalInput
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={140}
                  required
                  placeholder={t("inh.fieldTitlePlaceholder")}
                  disabled={busy}
                />
              </Field>

              <Field
                label={t("inh.fieldSecret")}
                hint={t("inh.fieldSecretHint")}
              >
                <textarea
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  required
                  rows={6}
                  placeholder={t("inh.fieldSecretPlaceholder")}
                  className="w-full border-2 border-black bg-white px-3 py-2 font-mono text-sm text-black outline-none placeholder:text-gray-400 focus:bg-[#00e676]/5 disabled:bg-gray-100"
                  disabled={busy}
                />
              </Field>

              <Field
                label={t("inh.fieldValidators", { count: preset.total })}
                hint={t("inh.fieldValidatorsHint")}
              >
                <div className="flex flex-col gap-2">
                  {Array.from({ length: preset.total }).map((_, i) => (
                    <BrutalInput
                      key={i}
                      type="text"
                      value={validators[i] ?? ""}
                      onChange={(e) => {
                        const next = [...validators];
                        next[i] = e.target.value;
                        setValidators(next);
                      }}
                      placeholder={t("inh.validatorPlaceholder", { i: i + 1 })}
                      disabled={busy}
                    />
                  ))}
                </div>
              </Field>
            </div>

            {/* Right column — config + actions */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
              <Field
                label={t("inh.fieldThreshold")}
                hint={t("inh.fieldThresholdHint")}
              >
                <div className="flex flex-col gap-2">
                  {THRESHOLD_PRESETS.map((p, idx) => (
                    <label
                      key={p.label}
                      className={`border-2 border-black px-3 py-2 cursor-pointer font-mono text-sm font-bold uppercase tracking-widest ${
                        thresholdIdx === idx
                          ? "bg-black text-[#00e676]"
                          : "bg-white text-black hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="threshold"
                        value={idx}
                        checked={thresholdIdx === idx}
                        onChange={() => setThresholdIdx(idx)}
                        className="sr-only"
                        disabled={busy}
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </Field>

              <Field
                label={t("inh.fieldHeartbeat")}
                hint={t("inh.fieldHeartbeatHint")}
              >
                <div className="flex flex-col gap-2">
                  {(Object.keys(HEARTBEAT_PRESETS) as HeartbeatPreset[]).map(
                    (k) => (
                      <label
                        key={k}
                        className={`border-2 border-black px-3 py-2 cursor-pointer font-mono text-sm font-bold uppercase tracking-widest ${
                          heartbeat === k
                            ? "bg-black text-[#00e676]"
                            : "bg-white text-black hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="heartbeat"
                          value={k}
                          checked={heartbeat === k}
                          onChange={() => setHeartbeat(k)}
                          className="sr-only"
                          disabled={busy}
                        />
                        {HEARTBEAT_PRESETS[k].label}
                      </label>
                    ),
                  )}
                </div>
              </Field>

              <button
                type="submit"
                disabled={busy || !isReady}
                className="border-2 border-black bg-black px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-[#00e676] hover:bg-[#00e676] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "…" : `[${t("inh.btnSeal").toUpperCase()}]`}
              </button>

              {statusLine && (
                <div className="border-2 border-black bg-[#00e676] px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black">
                  {statusLine}
                </div>
              )}

              {status.kind === "error" && (
                <div className="border-2 border-black bg-white px-3 py-2 font-mono text-xs uppercase tracking-widest text-red-700">
                  {status.messageKey
                    ? t(status.messageKey, status.messageVars)
                    : status.raw}
                </div>
              )}

              {!isReady && (
                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                  {t("inh.errorConnect")}
                </p>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
        {label}
      </span>
      {children}
      {hint && (
        <span className="font-mono text-[10px] text-gray-500 leading-snug">
          {hint}
        </span>
      )}
    </div>
  );
}

function BrutalInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border-2 border-black bg-white px-3 py-2 font-mono text-sm text-black outline-none placeholder:text-gray-400 focus:bg-[#00e676]/5 disabled:bg-gray-100"
    />
  );
}
