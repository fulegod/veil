"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

import { Header } from "@/components/Header";
import { useLanguage } from "@/components/LanguageProvider";
import { getCapsule, type CapsuleEntity } from "@/lib/arkiv";
import { decryptCiphertextToBytes } from "@/lib/tlock";
import {
  unpackCapsulePayload,
  type CapsuleContent,
} from "@/lib/capsule-payload";
import { explorerEntityUrl } from "@/lib/config";

type LoadState =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "loaded"; capsule: CapsuleEntity };

type RevealState =
  | { kind: "locked" }
  | { kind: "decrypting" }
  | { kind: "revealed"; content: CapsuleContent }
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

  useEffect(() => {
    if (load.kind !== "loaded") return;
    const { unlockAt, ciphertext } = load.capsule;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    function runDecrypt() {
      if (cancelled) return;
      setReveal({ kind: "decrypting" });
      decryptCiphertextToBytes(ciphertext)
        .then((bytes) => {
          if (cancelled) return;
          const content = unpackCapsulePayload(bytes);
          setReveal({ kind: "revealed", content });
        })
        .catch((err) => {
          if (cancelled) return;
          const message = err instanceof Error ? err.message : String(err);
          setReveal({ kind: "error", message });
        });
    }

    const delay = unlockAt - Date.now();
    if (delay <= 0) runDecrypt();
    else timer = setTimeout(runDecrypt, delay);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [load]);

  return (
    <div className="flex flex-col flex-1 bg-white text-black">
      <Header />
      <div className="mx-auto w-full max-w-[1280px] flex flex-col gap-6 p-4 md:p-8">
        {load.kind === "loading" && (
          <BrutalSection tag="[§CAPSULE — LOADING]">
            <p className="font-mono text-sm text-gray-500">
              [{t("view.loading")}]
            </p>
          </BrutalSection>
        )}

        {load.kind === "not-found" && (
          <BrutalSection tag="[§CAPSULE — 404]">
            <h1 className="text-3xl uppercase tracking-tighter md:text-4xl">
              {t("view.notFound")}
            </h1>
            <p className="mt-3 text-sm text-gray-700 lowercase text-justify">
              {t("view.notFoundBody")}{" "}
              <code className="border-2 border-black bg-white px-1 font-mono text-xs">
                {entityKey}
              </code>
            </p>
            <Link
              href="/"
              className="mt-4 inline-block border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0_rgba(0,0,0,1)] hover:bg-[#00e676]"
            >
              [{t("view.notFoundBack")}]
            </Link>
          </BrutalSection>
        )}

        {load.kind === "loaded" && (
          <CapsuleView
            capsule={load.capsule}
            now={now}
            reveal={reveal}
            entityKey={entityKey}
          />
        )}
      </div>
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
  const isUnlocked = now >= capsule.unlockAt;

  return (
    <>
      <BrutalSection tag="[§CAPSULE]" tagAccent>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge accent={isUnlocked}>
                {isUnlocked ? t("view.badgeUnlocked") : t("view.badgeLocked")}
              </Badge>
              <Badge inverted={!capsule.isPublic}>
                {capsule.isPublic
                  ? t("view.badgePublic")
                  : t("view.badgeUnlisted")}
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl uppercase tracking-tighter md:text-5xl">
              {capsule.title || t("view.untitled")}
            </h1>

            {!isUnlocked && (
              <Countdown unlockAt={capsule.unlockAt} now={now} t={t} />
            )}

            <div className="mt-6 border-2 border-black bg-white">
              <div className="border-b-2 border-black bg-black px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
                [{t("view.contents")}]
              </div>
              <div className="p-4 font-mono text-sm">
                {reveal.kind === "locked" && (
                  <p className="lowercase text-gray-700">
                    {t("view.sealed", {
                      bytes: capsule.ciphertext.length,
                      round: capsule.unlockRound,
                    })}
                  </p>
                )}
                {reveal.kind === "decrypting" && (
                  <p className="text-gray-700">
                    <span className="bg-black px-1 text-[#00e676]">[…]</span>{" "}
                    {t("view.decrypting")}
                  </p>
                )}
                {reveal.kind === "revealed" && (
                  <RevealedContent content={reveal.content} />
                )}
                {reveal.kind === "error" && (
                  <p className="text-black">
                    <span className="bg-black px-1 text-white">[ERROR]</span>{" "}
                    {t("view.decryptError")} {reveal.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <aside className="col-span-12 border-t-2 border-black pt-4 md:col-span-4 md:border-l-2 md:border-t-0 md:pl-6 md:pt-0">
            <MetaItem label={t("view.metaCreator")}>
              <span className="font-mono text-xs break-all">
                {capsule.creator || t("view.unknown")}
              </span>
            </MetaItem>
            <MetaItem label={t("view.metaOwner")}>
              <span className="font-mono text-xs break-all">
                {capsule.owner || t("view.unknown")}
              </span>
            </MetaItem>
            <MetaItem label={t("view.metaUnlockAt")}>
              <span className="font-mono text-xs">
                {new Date(capsule.unlockAt).toLocaleString()}
              </span>
            </MetaItem>
            <MetaItem label={t("view.metaUnlockRound")}>
              <span className="font-mono text-xs">{capsule.unlockRound}</span>
            </MetaItem>
            <MetaItem label={t("view.metaEntityKey")}>
              <a
                href={explorerEntityUrl(entityKey)}
                target="_blank"
                rel="noreferrer"
                className="break-all border-b-2 border-black font-mono text-xs hover:border-[#00e676] hover:text-[#00e676]"
              >
                {entityKey}
              </a>
            </MetaItem>
            <MetaItem label={t("view.metaExpires")}>
              <span className="font-mono text-xs">
                {String(capsule.expiresAtBlock)}
              </span>
            </MetaItem>
          </aside>
        </div>
      </BrutalSection>
    </>
  );
}

/**
 * RevealedContent — branches on the unpacked CapsuleContent kind. For files
 * it builds an in-memory Blob URL so the browser renders images/audio/video
 * inline without ever touching disk. Unknown mime types fall back to a
 * download button.
 */
function RevealedContent({ content }: { content: CapsuleContent }) {
  // Build a Blob URL for files. useMemo isn't enough here because we also need
  // to revoke the URL on unmount.
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  useEffect(() => {
    if (content.kind !== "file") return;
    const url = URL.createObjectURL(
      new Blob([new Uint8Array(content.bytes)], { type: content.mime }),
    );
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [content]);

  if (content.kind === "text") {
    return (
      <pre className="whitespace-pre-wrap break-words text-black">
        {content.text}
      </pre>
    );
  }

  const { filename, mime, bytes } = content;
  const sizeKb = (bytes.length / 1024).toFixed(1);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-2 font-mono text-[10px] uppercase tracking-widest text-gray-700">
        <span>
          [FILE] {filename} · {sizeKb} KB · {mime || "binary"}
        </span>
        {blobUrl && (
          <a
            href={blobUrl}
            download={filename}
            className="border-2 border-black bg-black px-2 py-1 font-bold text-[#00e676] hover:bg-[#00e676] hover:text-black"
          >
            [↓ DOWNLOAD]
          </a>
        )}
      </div>

      {blobUrl && mime.startsWith("image/") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={blobUrl}
          alt={filename}
          className="block max-h-[600px] w-full border-2 border-black object-contain"
        />
      )}

      {blobUrl && mime.startsWith("audio/") && (
        <audio controls src={blobUrl} className="w-full">
          your browser does not support audio playback.
        </audio>
      )}

      {blobUrl && mime.startsWith("video/") && (
        <video
          controls
          src={blobUrl}
          className="block max-h-[600px] w-full border-2 border-black bg-black"
        >
          your browser does not support video playback.
        </video>
      )}

      {blobUrl && mime === "application/pdf" && (
        <iframe
          src={blobUrl}
          title={filename}
          className="block h-[600px] w-full border-2 border-black bg-white"
        />
      )}
    </div>
  );
}

function Countdown({
  unlockAt,
  now,
  t,
}: {
  unlockAt: number;
  now: number;
  t: ReturnType<typeof useLanguage>["t"];
}) {
  const ms = Math.max(0, unlockAt - now);
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return (
    <div className="mt-6 grid grid-cols-4 gap-0 border-2 border-black">
      {[
        ["D", d],
        ["H", h],
        ["M", m],
        ["S", s],
      ].map(([label, val], i) => (
        <div
          key={label as string}
          className={`flex flex-col items-center p-3 ${i > 0 ? "border-l-2 border-black" : ""}`}
        >
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
            [{label}]
          </div>
          <div className="font-mono text-2xl font-bold tabular-nums text-[#00e676] md:text-3xl">
            {String(val).padStart(2, "0")}
          </div>
        </div>
      ))}
      <div className="col-span-4 border-t-2 border-black bg-black px-3 py-1 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
        [{t("view.unlocksIn")}]
      </div>
    </div>
  );
}

function Badge({
  accent,
  inverted,
  children,
}: {
  accent?: boolean;
  inverted?: boolean;
  children: React.ReactNode;
}) {
  const cls = accent
    ? "bg-[#00e676] text-black"
    : inverted
      ? "bg-white text-black border-2 border-black"
      : "bg-black text-white";
  return (
    <span
      className={`${cls} inline-block px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest`}
    >
      [{children}]
    </span>
  );
}

function MetaItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b-2 border-black py-3 last:border-b-0">
      <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
        [{label}]
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function BrutalSection({
  tag,
  tagAccent,
  children,
}: {
  tag: string;
  tagAccent?: boolean;
  children: React.ReactNode;
}) {
  const tagClass = tagAccent
    ? "bg-[#00e676] text-black"
    : "bg-black text-white";
  return (
    <section className="relative border-2 border-black bg-white p-6 md:p-12">
      <div
        className={`absolute top-0 left-0 ${tagClass} px-2 py-1 text-[10px] font-bold uppercase tracking-widest`}
      >
        {tag}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
