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

import { useAccount, useBalance, useChainId } from "wagmi";

import { BragaOnboarding } from "@/components/BragaOnboarding";
import { Header } from "@/components/Header";
// InheritanceIntro moved to /inheritance dashboard — this page is just the form.
import { useLanguage } from "@/components/LanguageProvider";
import { useArkivClients } from "@/hooks/useArkivClients";
import { encryptForTime, encryptBytesForTime } from "@/lib/tlock";
import { createInheritanceBundle } from "@/lib/arkiv";
import { ACTION_TYPE } from "@/lib/config";
import {
  MAX_CAPSULE_FILE_BYTES,
  packCapsulePayload,
} from "@/lib/capsule-payload";
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
  | { kind: "doc"; i: number; n: number }
  | { kind: "action"; i: number; n: number }
  | { kind: "done"; entityKey: string }
  | {
      kind: "error";
      messageKey?: TKey;
      messageVars?: Record<string, string | number>;
      raw?: string;
    };

const isAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v.trim());
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// Email trigger row — what the user composes for each scheduled email Action
interface EmailTrigger {
  recipient: string;
  message: string;
  timing: "on-expiry" | "warn-7d" | "warn-30d";
}

// Doc-drop trigger row — owner attaches a file to be released after the
// heartbeat expires. The file is timelock-encrypted client-side, stored as
// an unlisted Capsule entity, then a doc_drop Action keeps the recipient +
// link metadata so the cron can email when the time comes.
interface DocDropTrigger {
  recipient: string;
  message: string;
  file: File | null;
}

const BRAGA_CHAIN_ID = 60138453102;

export default function NewInheritancePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { arkivWallet, isReady, address } = useArkivClients();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address,
    chainId: BRAGA_CHAIN_ID,
  });
  // Onboarding banner shows when wallet/chain/balance aren't ready
  const needsOnboarding =
    !isConnected ||
    chainId !== BRAGA_CHAIN_ID ||
    !balance ||
    balance.value === BigInt(0);

  const [title, setTitle] = useState("");

  // Pre-fill title from ?title= query param (set by the InheritanceIntro
  // use-case picker on /inheritance). Reading via window.location instead of
  // useSearchParams() avoids the Suspense-boundary requirement that breaks
  // prerender in Next 16 with Turbopack.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const titleFromUrl = new URLSearchParams(window.location.search).get(
      "title",
    );
    if (titleFromUrl) setTitle(titleFromUrl);
  }, []);
  const [secret, setSecret] = useState("");
  const [thresholdIdx, setThresholdIdx] = useState(1); // 3-of-5 default
  const [heartbeat, setHeartbeat] =
    useState<HeartbeatPreset>(DEFAULT_HEARTBEAT);
  const [validators, setValidators] = useState<string[]>(["", "", "", "", ""]);
  const [emailTriggers, setEmailTriggers] = useState<EmailTrigger[]>([]);
  const [docDrops, setDocDrops] = useState<DocDropTrigger[]>([]);
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
      const sharesRaw = splitSecret(secret, preset.threshold, preset.total);

      // Build the email-action list from the configured triggers.
      const validEmails = emailTriggers.filter(
        (et) => isEmail(et.recipient) && et.message.trim().length > 0,
      );
      const emailActions = validEmails.map((et) => {
        const triggerAtMs =
          et.timing === "on-expiry"
            ? heartbeatAt
            : et.timing === "warn-7d"
              ? heartbeatAt - 7 * 24 * 60 * 60 * 1000
              : heartbeatAt - 30 * 24 * 60 * 60 * 1000;
        const actionType =
          et.timing === "on-expiry"
            ? ACTION_TYPE.EMAIL_DELIVERY
            : ACTION_TYPE.EMAIL_WARNING;
        return {
          actionType,
          triggerAtMs,
          destination: et.recipient.trim(),
          message: et.message.trim(),
        };
      });

      // Build the doc-drop list: encrypt each file client-side now, then hand
      // the ciphertext to the bundle so it can mint Capsules in batch.
      const validDocs = docDrops.filter(
        (d) => isEmail(d.recipient) && !!d.file,
      );
      const docDropInputs = [] as Array<{
        triggerAtMs: number;
        destination: string;
        message: string;
        capsule: {
          ciphertext: Uint8Array;
          unlockRound: number;
          heartbeatAt: number;
          title: string;
        };
      }>;
      for (let i = 0; i < validDocs.length; i++) {
        const d = validDocs[i];
        const f = d.file!;
        setStatus({ kind: "doc", i: i + 1, n: validDocs.length });
        if (f.size > MAX_CAPSULE_FILE_BYTES) {
          throw new Error(
            `File "${f.name}" is ${(f.size / 1024).toFixed(0)} KB. Limit is ${(MAX_CAPSULE_FILE_BYTES / 1024).toFixed(0)} KB.`,
          );
        }
        const fileBytes = new Uint8Array(await f.arrayBuffer());
        const wrapped = packCapsulePayload({
          kind: "file",
          filename: f.name,
          mime: f.type || "application/octet-stream",
          bytes: fileBytes,
        });
        const enc = await encryptBytesForTime(wrapped, heartbeatAt);
        docDropInputs.push({
          triggerAtMs: heartbeatAt,
          destination: d.recipient.trim(),
          message: d.message.trim() || f.name,
          capsule: {
            ciphertext: enc.ciphertext,
            unlockRound: enc.round,
            heartbeatAt,
            title: `${title.trim()} — ${f.name}`,
          },
        });
      }

      // ───── Batch mint everything ─────
      // Pattern 12: mutateEntities collapses what would be 1 (vault) + N
      // (shares) + M (email actions) + 2K (capsule + action per doc-drop)
      // wallet signatures into 2-3 total, no matter the volume.
      setStatus({ kind: "vault" });
      const bundle = await createInheritanceBundle({
        walletClient: arkivWallet,
        vault: {
          ciphertext,
          unlockRound: round,
          heartbeatAt,
          title: title.trim(),
          threshold: preset.threshold,
          totalShares: preset.total,
        },
        shares: sharesRaw.map((s, i) => ({
          shareIndex: i + 1,
          validatorAddress: trimmed[i],
          shareHex: shareToHex(s),
        })),
        emailActions,
        docDrops: docDropInputs,
      });

      setStatus({ kind: "done", entityKey: bundle.vaultKey });
      setTimeout(() => router.push(`/inheritance/${bundle.vaultKey}`), 1500);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", raw });
    }
  }

  // Email trigger editor helpers
  function addEmailTrigger() {
    setEmailTriggers((prev) => [
      ...prev,
      { recipient: "", message: "", timing: "on-expiry" },
    ]);
  }
  function updateEmailTrigger(idx: number, patch: Partial<EmailTrigger>) {
    setEmailTriggers((prev) =>
      prev.map((et, i) => (i === idx ? { ...et, ...patch } : et)),
    );
  }
  function removeEmailTrigger(idx: number) {
    setEmailTriggers((prev) => prev.filter((_, i) => i !== idx));
  }

  // Doc-drop trigger editor helpers
  function addDocDrop() {
    setDocDrops((prev) => [
      ...prev,
      { recipient: "", message: "", file: null },
    ]);
  }
  function updateDocDrop(idx: number, patch: Partial<DocDropTrigger>) {
    setDocDrops((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)),
    );
  }
  function removeDocDrop(idx: number) {
    setDocDrops((prev) => prev.filter((_, i) => i !== idx));
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
      case "action":
        return t("inh.statusActioning", { i: status.i, n: status.n });
      case "doc":
        return t("inh.statusSealingDoc", { i: status.i, n: status.n });
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
        {needsOnboarding && <BragaOnboarding variant="compact" />}
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
            [{t("sec.newVault")}]
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

              {/* ── Email triggers (Action entities) — optional, multi-row ── */}
              <div className="border-t-2 border-black pt-6">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
                      [{t("et.header")}]
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-gray-500 leading-snug">
                      {t("et.hint")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addEmailTrigger}
                    disabled={busy}
                    className="border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-black hover:bg-black hover:text-[#00e676] disabled:opacity-50"
                  >
                    {t("et.addCta")}
                  </button>
                </div>

                {emailTriggers.length === 0 && (
                  <p className="mt-3 border-2 border-dashed border-gray-300 bg-white p-3 font-mono text-[10px] uppercase tracking-widest text-gray-500">
                    {t("et.empty")}
                  </p>
                )}

                <div className="mt-3 flex flex-col gap-3">
                  {emailTriggers.map((et, i) => (
                    <div key={i} className="border-2 border-black bg-white p-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
                          [{t("et.label")} {String(i + 1).padStart(2, "0")}]
                        </p>
                        <button
                          type="button"
                          onClick={() => removeEmailTrigger(i)}
                          disabled={busy}
                          className="font-mono text-[10px] uppercase tracking-widest text-gray-500 hover:text-black"
                        >
                          [{t("et.remove")}]
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                        <BrutalInput
                          type="email"
                          value={et.recipient}
                          onChange={(e) =>
                            updateEmailTrigger(i, { recipient: e.target.value })
                          }
                          placeholder={t("et.emailPlaceholder")}
                          disabled={busy}
                        />
                        <select
                          value={et.timing}
                          onChange={(e) =>
                            updateEmailTrigger(i, {
                              timing: e.target.value as EmailTrigger["timing"],
                            })
                          }
                          disabled={busy}
                          className="w-full border-2 border-black bg-white px-3 py-2 font-mono text-sm text-black outline-none focus:bg-[#00e676]/5 disabled:bg-gray-100"
                        >
                          <option value="on-expiry">
                            {t("et.optionOnExpiry")}
                          </option>
                          <option value="warn-7d">{t("et.option7d")}</option>
                          <option value="warn-30d">{t("et.option30d")}</option>
                        </select>
                      </div>
                      <textarea
                        value={et.message}
                        onChange={(e) =>
                          updateEmailTrigger(i, { message: e.target.value })
                        }
                        rows={3}
                        placeholder={t("et.messagePlaceholder")}
                        disabled={busy}
                        className="mt-2 w-full border-2 border-black bg-white px-3 py-2 font-mono text-sm text-black outline-none placeholder:text-gray-400 focus:bg-[#00e676]/5 disabled:bg-gray-100"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Document drops — file is timelock-sealed in a Capsule ── */}
              <div className="border-t-2 border-black pt-6">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">
                      [{t("dd.header")}]
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-gray-500 leading-snug">
                      {t("dd.hint")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addDocDrop}
                    disabled={busy}
                    className="shrink-0 border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-black hover:bg-black hover:text-[#00e676] disabled:opacity-50"
                  >
                    {t("dd.addCta")}
                  </button>
                </div>

                {docDrops.length === 0 && (
                  <p className="mt-3 border-2 border-dashed border-gray-300 bg-white p-3 font-mono text-[10px] uppercase tracking-widest text-gray-500">
                    {t("dd.empty")}
                  </p>
                )}

                <div className="mt-3 flex flex-col gap-3">
                  {docDrops.map((d, i) => (
                    <div key={i} className="border-2 border-black bg-white p-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
                          [{t("dd.label")} {String(i + 1).padStart(2, "0")}]
                        </p>
                        <button
                          type="button"
                          onClick={() => removeDocDrop(i)}
                          disabled={busy}
                          className="font-mono text-[10px] uppercase tracking-widest text-gray-500 hover:text-black"
                        >
                          [{t("et.remove")}]
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                        <BrutalInput
                          type="email"
                          value={d.recipient}
                          onChange={(e) =>
                            updateDocDrop(i, { recipient: e.target.value })
                          }
                          placeholder={t("et.emailPlaceholder")}
                          disabled={busy}
                        />
                        {d.file ? (
                          <div className="flex items-center justify-between gap-2 border-2 border-black bg-[#00e676]/15 px-3 py-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-mono text-[11px] font-bold uppercase tracking-widest text-black">
                                {d.file.name}
                              </p>
                              <p className="font-mono text-[9px] uppercase tracking-widest text-gray-700">
                                {(d.file.size / 1024).toFixed(1)} KB ·{" "}
                                {d.file.type || "binary"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => updateDocDrop(i, { file: null })}
                              disabled={busy}
                              className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-gray-500 hover:text-black"
                            >
                              [{t("dd.clear")}]
                            </button>
                          </div>
                        ) : (
                          <input
                            type="file"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) updateDocDrop(i, { file: f });
                            }}
                            disabled={busy}
                            className="block w-full border-2 border-dashed border-black bg-white px-3 py-1.5 font-mono text-[11px] text-black file:mr-3 file:border-2 file:border-black file:bg-black file:px-2 file:py-0.5 file:font-mono file:text-[9px] file:font-bold file:uppercase file:tracking-widest file:text-[#00e676] hover:file:bg-[#00e676] hover:file:text-black disabled:bg-gray-100"
                          />
                        )}
                      </div>
                      <textarea
                        value={d.message}
                        onChange={(e) =>
                          updateDocDrop(i, { message: e.target.value })
                        }
                        rows={2}
                        placeholder={t("dd.messagePlaceholder")}
                        disabled={busy}
                        className="mt-2 w-full border-2 border-black bg-white px-3 py-2 font-mono text-sm text-black outline-none placeholder:text-gray-400 focus:bg-[#00e676]/5 disabled:bg-gray-100"
                      />
                    </div>
                  ))}
                </div>
              </div>
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
                        {t(`preset.heartbeat.${k}` as never)}
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
