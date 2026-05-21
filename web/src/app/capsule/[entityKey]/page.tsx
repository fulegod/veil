"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

import { Header } from "@/components/Header";
import { useLanguage } from "@/components/LanguageProvider";
import { useArkivClients } from "@/hooks/useArkivClients";
import {
  getCapsule,
  findFirstRevealForCapsule,
  publishReveal,
  sha256Hex,
  type CapsuleEntity,
  type RevealEntity,
} from "@/lib/arkiv";
import { decryptCiphertext } from "@/lib/tlock";
import { explorerEntityUrl, explorerTxUrl } from "@/lib/config";

type LoadState =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "loaded"; capsule: CapsuleEntity };

type RevealState =
  | { kind: "locked" }
  | { kind: "decrypting" }
  | { kind: "revealed"; plaintext: string }
  | { kind: "error"; message: string };

export default function CapsulePage({
  params,
}: {
  params: Promise<{ entityKey: string }>;
}) {
  const { entityKey } = use(params);
  const { t } = useLanguage();

  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  const [reveal, setReveal] = useState<RevealState>({ kind: "locked" });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const capsule = await getCapsule(entityKey);
        if (cancelled) return;
        setLoad(capsule ? { kind: "loaded", capsule } : { kind: "not-found" });
      } catch (err) {
        if (cancelled) return;
        setLoad({ kind: "not-found" });
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entityKey]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Decrypt effect — INTENTIONALLY does NOT depend on `now` (the per-second
  // ticker). If `now` were in deps, the cleanup would run every second,
  // setting `cancelled = true` on the in-flight decrypt promise → the .then
  // would no-op and the UI stayed in "decrypting…" forever. Subtle bug,
  // hours lost. The decrypt only depends on (a) the capsule being loaded
  // and (b) the unlock time having passed. We capture `unlockAt` from the
  // loaded capsule and schedule a one-shot timer for that moment.
  useEffect(() => {
    if (load.kind !== "loaded") return;
    const { unlockAt, ciphertext } = load.capsule;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    function runDecrypt() {
      if (cancelled) return;
      setReveal({ kind: "decrypting" });
      decryptCiphertext(ciphertext)
        .then((plaintext) => {
          if (!cancelled) setReveal({ kind: "revealed", plaintext });
        })
        .catch((err) => {
          if (cancelled) return;
          const message = err instanceof Error ? err.message : String(err);
          setReveal({ kind: "error", message });
        });
    }

    const delay = unlockAt - Date.now();
    if (delay <= 0) {
      // Already past unlock — decrypt immediately
      runDecrypt();
    } else {
      // Wait until the unlock moment
      timer = setTimeout(runDecrypt, delay);
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [load]);

  return (
    <div className="flex flex-col flex-1 bg-[#f4f7f9]">
      <Header />

      <main className="flex flex-1 justify-center px-6 py-12">
        <article className="w-full max-w-2xl space-y-8">
          {load.kind === "loading" && (
            <div className="text-[#666]">{t("view.loading")}</div>
          )}

          {load.kind === "not-found" && (
            <div className="space-y-4 rounded-[14px] bg-white p-9 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-black uppercase text-[#0b294d]">
                {t("view.notFound")}
              </h1>
              <p className="text-sm text-[#666]">
                {t("view.notFoundBody")}{" "}
                <code className="ml-1 font-[family-name:var(--font-geist-mono)] text-xs text-[#222] bg-[#f4f7f9] px-1.5 py-0.5 rounded">
                  {entityKey}
                </code>
              </p>
              <Link
                href="/"
                className="inline-block text-sm font-bold text-[#0099ff] hover:text-[#0b294d]"
              >
                {t("view.notFoundBack")}
              </Link>
            </div>
          )}

          {load.kind === "loaded" && (
            <CapsuleView
              capsule={load.capsule}
              now={now}
              reveal={reveal}
              entityKey={entityKey}
            />
          )}
        </article>
      </main>
    </div>
  );
}

function CapsuleView({
  capsule,
  now,
  reveal,
  entityKey,
}: {
  capsule: CapsuleEntity;
  now: number;
  reveal: RevealState;
  entityKey: string;
}) {
  const { t } = useLanguage();
  const isUnlockTimeReached = now >= capsule.unlockAt;

  return (
    <div className="space-y-6 rounded-[14px] bg-white p-9 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-2">
        <Badge
          color={isUnlockTimeReached ? "success" : "warning"}
          label={
            isUnlockTimeReached
              ? t("view.badgeUnlocked")
              : t("view.badgeLocked")
          }
        />
        <Badge
          color={capsule.isPublic ? "brand" : "neutral"}
          label={
            capsule.isPublic ? t("view.badgePublic") : t("view.badgeUnlisted")
          }
        />
      </div>

      <h1 className="font-[family-name:var(--font-barlow)] text-4xl font-black uppercase tracking-tight text-[#0b294d]">
        {capsule.title || t("view.untitled")}
      </h1>

      {!isUnlockTimeReached && (
        <Countdown unlockAt={capsule.unlockAt} now={now} />
      )}

      <div className="rounded-[8px] border border-[#eee] bg-[#f4f7f9]">
        <div className="border-b border-[#eee] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#666]">
          {t("view.contents")}
        </div>
        <div className="p-4 text-sm">
          {reveal.kind === "locked" && (
            <p className="text-[#666] italic">
              {t("view.sealed", {
                bytes: capsule.ciphertext.length,
                round: capsule.unlockRound,
              })}
            </p>
          )}
          {reveal.kind === "decrypting" && (
            <p className="text-[#666]">{t("view.decrypting")}</p>
          )}
          {reveal.kind === "revealed" && (
            <pre className="whitespace-pre-wrap break-words font-[family-name:var(--font-geist-mono)] text-sm text-[#222]">
              {reveal.plaintext}
            </pre>
          )}
          {reveal.kind === "error" && (
            <p className="text-[#9b2c2c]">
              {t("view.decryptError")} {reveal.message}
            </p>
          )}
        </div>
      </div>

      {reveal.kind === "revealed" && (
        <RevealSection capsuleKey={entityKey} plaintext={reveal.plaintext} />
      )}

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm border-t border-[#eee] pt-6">
        <Meta label={t("view.metaCreator")}>
          <span className="font-[family-name:var(--font-geist-mono)] text-xs text-[#222]">
            {capsule.creator || t("view.unknown")}
          </span>
        </Meta>
        <Meta label={t("view.metaOwner")}>
          <span className="font-[family-name:var(--font-geist-mono)] text-xs text-[#222]">
            {capsule.owner || t("view.unknown")}
          </span>
        </Meta>
        <Meta label={t("view.metaUnlockAt")}>
          <span className="text-[#222]">
            {new Date(capsule.unlockAt).toLocaleString()}
          </span>
        </Meta>
        <Meta label={t("view.metaUnlockRound")}>
          <span className="font-[family-name:var(--font-geist-mono)] text-xs text-[#222]">
            {capsule.unlockRound}
          </span>
        </Meta>
        <Meta label={t("view.metaEntityKey")}>
          <a
            href={explorerEntityUrl(entityKey)}
            target="_blank"
            rel="noreferrer"
            className="font-[family-name:var(--font-geist-mono)] text-xs text-[#0099ff] hover:text-[#0b294d] break-all"
          >
            {entityKey}
          </a>
        </Meta>
        <Meta label={t("view.metaExpires")}>
          <span className="font-[family-name:var(--font-geist-mono)] text-xs text-[#222]">
            {String(capsule.expiresAtBlock)}
          </span>
        </Meta>
      </dl>
    </div>
  );
}

/**
 * Reveal section — shows the public reveal record (2nd entity type).
 * - If someone already published a reveal for this capsule, display it.
 * - Otherwise, if wallet connected, offer to publish one.
 */
function RevealSection({
  capsuleKey,
  plaintext,
}: {
  capsuleKey: string;
  plaintext: string;
}) {
  const { t } = useLanguage();
  const { arkivWallet, isReady } = useArkivClients();

  const [reveal, setReveal] = useState<RevealEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  // Fetch the first reveal for this capsule on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const found = await findFirstRevealForCapsule(capsuleKey);
        if (!cancelled) setReveal(found);
      } catch (err) {
        console.error("findFirstReveal failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [capsuleKey]);

  async function handlePublish() {
    if (!isReady || !arkivWallet) {
      setError(t("reveal.errorConnect"));
      return;
    }
    setError(null);
    setPublishing(true);
    try {
      const hash = await sha256Hex(plaintext);
      const { entityKey, txHash } = await publishReveal({
        walletClient: arkivWallet,
        capsuleKey,
        plaintextHash: hash,
      });
      setLastTxHash(txHash);
      // Optimistic update — re-fetch will fix it if Arkiv state diverges
      const wallet = await arkivWallet.account.address;
      setReveal({
        entityKey,
        creator: wallet ?? "",
        capsuleKey,
        revealedAt: Date.now(),
        decryptedHash: hash,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <section className="rounded-[8px] border border-[#0099ff]/20 bg-[#f0f8ff] p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-[#0099ff]">
        {t("reveal.section")}
      </div>

      {loading && (
        <p className="mt-2 text-sm text-[#666]">{t("common.loading")}</p>
      )}

      {!loading && reveal && (
        <div className="mt-3 space-y-1 text-sm">
          <p className="text-[#222]">
            {t("reveal.firstBy", {
              wallet: `${reveal.creator.slice(0, 6)}…${reveal.creator.slice(
                -4,
              )}`,
            })}
          </p>
          <p className="text-[#666]">
            {t("reveal.at", {
              time: new Date(reveal.revealedAt).toLocaleString(),
            })}
          </p>
          <p className="font-[family-name:var(--font-geist-mono)] text-xs text-[#666] break-all">
            sha256: {reveal.decryptedHash}
          </p>
        </div>
      )}

      {!loading && !reveal && (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-[#666]">{t("reveal.notYet")}</p>
          <p className="text-xs text-[#666] leading-relaxed">
            {t("reveal.ctaHint")}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing || !isReady}
              className="inline-flex h-10 items-center justify-center rounded-[6px] bg-[#0b294d] px-5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#0099ff] disabled:bg-[#ddd] disabled:text-[#999]"
            >
              {publishing ? t("reveal.publishing") : t("reveal.cta")}
            </button>
            {!isReady && (
              <span className="text-xs text-[#666]">
                {t("reveal.connectFirst")}
              </span>
            )}
          </div>
        </div>
      )}

      {lastTxHash && (
        <a
          href={explorerTxUrl(lastTxHash)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block font-[family-name:var(--font-geist-mono)] text-xs text-[#0099ff] underline hover:text-[#0b294d]"
        >
          tx →
        </a>
      )}

      {error && (
        <div className="mt-3 rounded-[6px] border border-[#e53e3e]/30 bg-[#fdecea] px-3 py-2 text-xs text-[#9b2c2c]">
          {t("reveal.error")} {error}
        </div>
      )}
    </section>
  );
}

function Countdown({ unlockAt, now }: { unlockAt: number; now: number }) {
  const { t } = useLanguage();
  const remainingMs = Math.max(0, unlockAt - now);
  const totalSec = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return (
    <div className="rounded-[8px] border border-[#d69e2e]/30 bg-[#fff8e1] px-4 py-3">
      <div className="text-xs font-bold uppercase tracking-wider text-[#7b5c00]">
        {t("view.unlocksIn")}
      </div>
      <div className="mt-1 font-[family-name:var(--font-geist-mono)] text-2xl font-bold text-[#7b5c00]">
        {days > 0 && `${days}d `}
        {String(hours).padStart(2, "0")}h {String(minutes).padStart(2, "0")}m{" "}
        {String(seconds).padStart(2, "0")}s
      </div>
    </div>
  );
}

function Badge({
  color,
  label,
}: {
  color: "success" | "warning" | "brand" | "neutral";
  label: string;
}) {
  const colors = {
    success: "bg-[#e8f5e9] border-[#28a745]/30 text-[#2e7d32]",
    warning: "bg-[#fff8e1] border-[#d69e2e]/30 text-[#7b5c00]",
    brand: "bg-[#0b294d] border-[#0b294d] text-white",
    neutral: "bg-[#f4f7f9] border-[#ddd] text-[#666]",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${colors[color]}`}
    >
      {label}
    </span>
  );
}

function Meta({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-[#666]">
        {label}
      </dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
