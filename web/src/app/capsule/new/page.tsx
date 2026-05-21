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
    <div className="flex flex-col flex-1 bg-white text-black">
      <Header />
      <div className="mx-auto w-full max-w-[1280px] flex flex-col gap-6 p-4 md:p-8">
        <section className="border-2 border-black bg-white p-6 md:p-12 relative">
          <div className="absolute top-0 left-0 bg-black text-white px-2 py-1 text-[10px] uppercase font-bold tracking-widest">
            [§NEW — SEAL A CALL]
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid grid-cols-12 gap-6"
          >
            {/* Left column — form */}
            <div className="col-span-12 md:col-span-8 flex flex-col gap-6">
              <div>
                <h1 className="text-3xl uppercase tracking-tighter md:text-5xl">
                  {t("new.title")}
                </h1>
                <p className="mt-3 text-xs leading-snug text-gray-700 lowercase text-justify md:text-sm">
                  {t("new.intro")}
                </p>
              </div>

              <Field label={t("new.fieldTitle")} hint={t("new.fieldTitleHint")}>
                <BrutalInput
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={140}
                  required
                  placeholder={t("new.fieldTitlePlaceholder")}
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
                  className="w-full border-2 border-black bg-white px-3 py-2 font-mono text-sm text-black outline-none placeholder:text-gray-400 focus:bg-[#00e676]/5 disabled:bg-gray-100"
                  disabled={busy}
                />
              </Field>

              <Field
                label={t("new.fieldUnlock")}
                hint={t("new.fieldUnlockHint")}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <input
                    type="datetime-local"
                    value={unlockLocal}
                    onChange={(e) => setUnlockLocal(e.target.value)}
                    required
                    className="border-2 border-black bg-white px-3 py-2 font-mono text-sm text-black outline-none focus:bg-[#00e676]/5"
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
                  className="mt-1 h-4 w-4 accent-[#00e676]"
                />
                <div>
                  <div className="font-mono text-xs font-bold uppercase tracking-widest">
                    [{t("new.fieldPublic")}]
                  </div>
                  <div className="mt-1 text-xs text-gray-600 lowercase">
                    {t("new.fieldPublicHint")}
                  </div>
                </div>
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={busy || !isReady}
                  className="border-2 border-black bg-black px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-[3px_3px_0_rgba(0,0,0,1)] transition-colors hover:bg-[#00e676] hover:text-black disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 md:text-sm"
                >
                  [
                  {status.kind === "encrypting"
                    ? t("new.statusEncrypting")
                    : status.kind === "submitting"
                      ? t("new.statusSubmitting")
                      : status.kind === "done"
                        ? t("new.statusDone")
                        : t("new.btnSeal")}
                  ]
                </button>
                {!isReady && (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                    [{t("common.connectFirst")}]
                  </span>
                )}
              </div>

              {status.kind === "error" && (
                <div className="border-2 border-black bg-white px-3 py-2 font-mono text-xs text-black shadow-[3px_3px_0_rgba(0,0,0,1)]">
                  <span className="bg-black px-1 text-white">[ERROR]</span>{" "}
                  {status.messageKey ? t(status.messageKey) : status.raw}
                </div>
              )}

              {status.kind === "done" && (
                <div className="border-2 border-black bg-[#00e676] px-3 py-2 font-mono text-xs text-black shadow-[3px_3px_0_rgba(0,0,0,1)]">
                  <div className="font-bold uppercase">
                    [{t("new.successSealed")}]
                  </div>
                  <a
                    href={explorerTxUrl(status.txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block border-b-2 border-black text-xs text-black hover:border-white hover:text-white"
                  >
                    [{t("new.viewTxLink")}]
                  </a>
                </div>
              )}
            </div>

            {/* Right column — sidebar */}
            <aside className="col-span-12 border-t-2 border-black pt-4 md:col-span-4 md:border-l-2 md:border-t-0 md:pl-6 md:pt-0">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                [CREATOR (IMMUTABLE)]
              </div>
              <div className="mt-1 break-all font-mono text-xs text-black">
                {address ?? "0x… — connect wallet"}
              </div>

              <div className="mt-6 font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                [HOW THIS WORKS]
              </div>
              <ol className="mt-2 list-none space-y-2 font-mono text-xs lowercase text-gray-700">
                <li>
                  <span className="text-[#00e676]">▸</span> body encrypted
                  client-side against a future drand round.
                </li>
                <li>
                  <span className="text-[#00e676]">▸</span> ciphertext stored as
                  an arkiv entity signed by your wallet.
                </li>
                <li>
                  <span className="text-[#00e676]">▸</span> nobody can decrypt
                  until the round publishes.
                </li>
              </ol>
            </aside>
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
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label className="font-mono text-xs font-bold uppercase tracking-widest">
          [{label}]
        </label>
        {hint && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function BrutalInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border-2 border-black bg-white px-3 py-2 font-mono text-sm text-black outline-none placeholder:text-gray-400 focus:bg-[#00e676]/5 disabled:bg-gray-100 ${
        props.className ?? ""
      }`}
    />
  );
}
