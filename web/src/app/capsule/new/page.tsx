"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/Header";
import { useLanguage } from "@/components/LanguageProvider";
import { TimezoneHint } from "@/components/TimezoneHint";
import { useArkivClients } from "@/hooks/useArkivClients";
import { encryptForTime } from "@/lib/tlock";
import { createCapsule } from "@/lib/arkiv";
import { explorerTxUrl } from "@/lib/config";
import type { TKey } from "@/lib/i18n";

type Status =
  | { kind: "idle" }
  | { kind: "encrypting" }
  | { kind: "submitting" }
  | { kind: "done"; entityKey: string; txHash: string }
  | { kind: "error"; messageKey?: TKey; raw?: string };

function defaultUnlockLocal(): string {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewCapsulePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { arkivWallet, isReady, address } = useArkivClients();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [unlockLocal, setUnlockLocal] = useState(defaultUnlockLocal());
  const [isPublic, setIsPublic] = useState(true);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: "idle" });

    if (!isReady || !arkivWallet) {
      setStatus({ kind: "error", messageKey: "new.errorConnect" });
      return;
    }
    if (!title.trim() || !body.trim()) {
      setStatus({ kind: "error", messageKey: "new.errorRequired" });
      return;
    }
    const unlockAtMs = new Date(unlockLocal).getTime();
    if (!Number.isFinite(unlockAtMs) || unlockAtMs <= Date.now() + 30_000) {
      setStatus({ kind: "error", messageKey: "new.errorUnlockTime" });
      return;
    }

    try {
      setStatus({ kind: "encrypting" });
      const { ciphertext, round } = await encryptForTime(body, unlockAtMs);

      setStatus({ kind: "submitting" });
      const { entityKey, txHash } = await createCapsule({
        walletClient: arkivWallet,
        ciphertext,
        unlockRound: round,
        unlockAt: unlockAtMs,
        title: title.trim(),
        isPublic,
      });

      setStatus({ kind: "done", entityKey, txHash });
      setTimeout(() => router.push(`/capsule/${entityKey}`), 1500);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", raw });
    }
  }

  const busy = status.kind === "encrypting" || status.kind === "submitting";

  return (
    <div className="flex flex-col flex-1 bg-[#f4f7f9]">
      <Header />

      <main className="flex flex-1 justify-center px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl space-y-7 rounded-[14px] bg-white p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
        >
          <div>
            <h1 className="font-[family-name:var(--font-barlow)] text-4xl font-black uppercase tracking-tight text-[#0b294d]">
              {t("new.title")}
            </h1>
            <p className="mt-2 text-sm text-[#666] leading-relaxed">
              {t("new.intro")}
            </p>
          </div>

          <Field label={t("new.fieldTitle")} hint={t("new.fieldTitleHint")}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={140}
              required
              placeholder={t("new.fieldTitlePlaceholder")}
              className="w-full rounded-[6px] border border-[#ddd] bg-white px-3 py-2.5 text-[#222] placeholder:text-[#999] focus:border-[#0099ff] focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20"
              disabled={busy}
            />
          </Field>

          <Field label={t("new.fieldBody")} hint={t("new.fieldBodyHint")}>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={8}
              placeholder={t("new.fieldBodyPlaceholder")}
              className="w-full rounded-[6px] border border-[#ddd] bg-white px-3 py-2.5 text-[#222] placeholder:text-[#999] focus:border-[#0099ff] focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20 font-[family-name:var(--font-geist-mono)] text-sm"
              disabled={busy}
            />
          </Field>

          <Field label={t("new.fieldUnlock")} hint={t("new.fieldUnlockHint")}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <input
                type="datetime-local"
                value={unlockLocal}
                onChange={(e) => setUnlockLocal(e.target.value)}
                required
                className="rounded-[6px] border border-[#ddd] bg-white pl-3 pr-2 py-2.5 text-[#222] focus:border-[#0099ff] focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20"
                disabled={busy}
              />
              <TimezoneHint />
            </div>
          </Field>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={busy}
              className="mt-1 h-4 w-4 rounded border-[#ddd] text-[#0b294d] focus:ring-[#0099ff]"
            />
            <div>
              <div className="text-sm font-bold text-[#222]">
                {t("new.fieldPublic")}
              </div>
              <div className="text-xs text-[#666]">
                {t("new.fieldPublicHint")}
              </div>
            </div>
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={busy || !isReady}
              className="inline-flex h-12 items-center justify-center rounded-[6px] bg-[#0b294d] px-7 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#0099ff] disabled:bg-[#ddd] disabled:text-[#999]"
            >
              {status.kind === "encrypting" && t("new.statusEncrypting")}
              {status.kind === "submitting" && t("new.statusSubmitting")}
              {status.kind === "done" && t("new.statusDone")}
              {(status.kind === "idle" || status.kind === "error") &&
                t("new.btnSeal")}
            </button>
            {!isReady && (
              <span className="text-xs text-[#666]">
                {t("common.connectFirst")}
              </span>
            )}
            {address && isReady && (
              <span className="font-[family-name:var(--font-geist-mono)] text-xs text-[#666]">
                {t("common.creator")}: {address.slice(0, 6)}…{address.slice(-4)}
              </span>
            )}
          </div>

          {status.kind === "error" && (
            <div className="rounded-[8px] border border-[#e53e3e]/30 bg-[#fdecea] px-4 py-3 text-sm text-[#9b2c2c]">
              {status.messageKey ? t(status.messageKey) : status.raw}
            </div>
          )}

          {status.kind === "done" && (
            <div className="rounded-[8px] border border-[#28a745]/30 bg-[#e8f5e9] px-4 py-3 text-sm text-[#2e7d32]">
              <div className="font-bold">{t("new.successSealed")}</div>
              <a
                href={explorerTxUrl(status.txHash)}
                target="_blank"
                rel="noreferrer"
                className="font-[family-name:var(--font-geist-mono)] text-xs underline hover:text-[#0099ff]"
              >
                {t("new.viewTxLink")}
              </a>
            </div>
          )}
        </form>
      </main>
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
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-bold text-[#222]">{label}</label>
        {hint && <span className="text-xs text-[#666]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
