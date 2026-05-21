"use client";

import Link from "next/link";
import { useAccount } from "wagmi";

import { Header } from "@/components/Header";
import { useLanguage } from "@/components/LanguageProvider";

// Real Veil capsule on Braga used as the live example. Created on 2026-05-21,
// unlocked 9:15 PM same day. Anyone can verify it on the explorer.
const LIVE_EXAMPLE_KEY =
  "0x91807c370f60f91312267f23a319f2d587b09a20b0cc502287ac1eb2081d403a";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col flex-1 bg-[#f4f7f9]">
      <Header />

      <HeroSection isConnected={isConnected} address={address} t={t} />
      <ProblemSection t={t} />
      <HowItWorksSection t={t} />
      <ExampleSection t={t} />
      <UseCasesSection t={t} />
      <WhyArkivSection t={t} />
      <TrustSection t={t} />
      <SiteFooter t={t} />
    </div>
  );
}

// ─── Section: HERO ──────────────────────────────────────────────────────────
type TFn = ReturnType<typeof useLanguage>["t"];

function HeroSection({
  isConnected,
  address,
  t,
}: {
  isConnected: boolean;
  address: `0x${string}` | undefined;
  t: TFn;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[#eee] bg-gradient-to-br from-white via-[#f4f7f9] to-[#eef3f9]">
      {/* Decorative grid — visible enough to give the page texture */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(#0b294d 1px, transparent 1px), linear-gradient(90deg, #0b294d 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />
      {/* Soft green glow in the corner */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#1a9e3a]/20 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32">
        <p className="font-[family-name:var(--font-geist-mono)] text-xs font-bold uppercase tracking-[0.2em] text-[#1a9e3a]">
          {t("home.heroEyebrow")}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-barlow)] text-6xl font-black uppercase leading-[0.95] tracking-tight text-[#0b294d] sm:text-7xl md:text-8xl">
          {t("home.heroTitleA")}
          <br />
          <span className="text-[#1a9e3a]">{t("home.heroTitleB")}</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#222]">
          {t("home.heroSubtitle")}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {isConnected ? (
            <Link
              href="/capsule/new"
              className="inline-flex h-12 items-center justify-center rounded-[6px] bg-[#1a9e3a] px-7 text-sm font-bold uppercase tracking-wider text-white shadow-[0_2px_12px_rgba(26,158,58,0.35)] transition-all hover:bg-[#157a2c] hover:shadow-[0_4px_20px_rgba(26,158,58,0.5)]"
            >
              {t("home.heroCtaPrimary")}
            </Link>
          ) : (
            <div className="inline-flex h-12 items-center rounded-[6px] border border-dashed border-[#ddd] bg-white px-5 text-sm text-[#666]">
              {t("home.connectFirst")}
            </div>
          )}
          <Link
            href="/capsules"
            className="inline-flex h-12 items-center justify-center rounded-[6px] border-2 border-[#0b294d] bg-transparent px-7 text-sm font-bold uppercase tracking-wider text-[#0b294d] transition-colors hover:bg-[#0b294d] hover:text-white"
          >
            {t("home.heroCtaSecondary")}
          </Link>
        </div>

        <p className="mt-8 font-[family-name:var(--font-geist-mono)] text-xs text-[#666]">
          {t("home.heroAttribution")}
        </p>

        {isConnected && address && (
          <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-xs text-[#999]">
            {address.slice(0, 6)}…{address.slice(-4)}
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Section: THE PROBLEM ───────────────────────────────────────────────────
function ProblemSection({ t }: { t: TFn }) {
  const points = [
    { title: t("home.problemPoint1Title"), body: t("home.problemPoint1Body") },
    { title: t("home.problemPoint2Title"), body: t("home.problemPoint2Body") },
    { title: t("home.problemPoint3Title"), body: t("home.problemPoint3Body") },
  ];

  return (
    <section className="bg-white py-20 border-b border-[#eee]">
      <div className="mx-auto max-w-5xl px-6">
        <SectionEyebrow color="danger">
          {t("home.problemEyebrow")}
        </SectionEyebrow>
        <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-barlow)] text-4xl font-black uppercase tracking-tight text-[#0b294d] sm:text-5xl">
          {t("home.problemTitle")}
        </h2>
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-[#666]">
          {t("home.problemBody")}
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {points.map((p, i) => (
            <div
              key={i}
              className="rounded-[14px] border border-[#fdecea] bg-[#fdecea]/40 p-6"
            >
              <div
                className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e53e3e] text-sm font-bold text-white"
                aria-hidden
              >
                {i + 1}
              </div>
              <h3 className="font-[family-name:var(--font-barlow)] text-xl font-bold uppercase tracking-tight text-[#0b294d]">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#666]">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: HOW IT WORKS ──────────────────────────────────────────────────
function HowItWorksSection({ t }: { t: TFn }) {
  const steps = [
    {
      tag: t("home.howStep1Tag"),
      title: t("home.howStep1Title"),
      body: t("home.howStep1Body"),
    },
    {
      tag: t("home.howStep2Tag"),
      title: t("home.howStep2Title"),
      body: t("home.howStep2Body"),
    },
    {
      tag: t("home.howStep3Tag"),
      title: t("home.howStep3Title"),
      body: t("home.howStep3Body"),
    },
  ];

  return (
    <section className="bg-[#f4f7f9] py-20 border-b border-[#eee]">
      <div className="mx-auto max-w-5xl px-6">
        <SectionEyebrow color="brand">{t("home.howEyebrow")}</SectionEyebrow>
        <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-barlow)] text-4xl font-black uppercase tracking-tight text-[#0b294d] sm:text-5xl">
          {t("home.howTitle")}
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className="relative rounded-[14px] border border-[#eee] bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
            >
              <span className="font-[family-name:var(--font-geist-mono)] text-xs font-bold uppercase tracking-[0.2em] text-[#1a9e3a]">
                {s.tag}
              </span>
              <h3 className="mt-3 font-[family-name:var(--font-barlow)] text-2xl font-bold uppercase tracking-tight text-[#0b294d]">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#666]">
                {s.body}
              </p>
              {i < steps.length - 1 && (
                <div
                  className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#1a9e3a] text-white md:flex"
                  aria-hidden
                >
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path fill="currentColor" d="M9 6l6 6-6 6V6z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: LIVE EXAMPLE ──────────────────────────────────────────────────
function ExampleSection({ t }: { t: TFn }) {
  return (
    <section className="bg-white py-20 border-b border-[#eee]">
      <div className="mx-auto max-w-5xl px-6">
        <SectionEyebrow color="brand">
          {t("home.exampleEyebrow")}
        </SectionEyebrow>
        <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-barlow)] text-4xl font-black uppercase tracking-tight text-[#0b294d] sm:text-5xl">
          {t("home.exampleTitle")}
        </h2>
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-[#666]">
          {t("home.exampleBody")}
        </p>

        <div className="mt-10 rounded-[14px] border border-[#eee] bg-gradient-to-br from-[#f4f7f9] to-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-[#28a745]/30 bg-[#e8f5e9] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#2e7d32]">
              Unlocked
            </span>
            <span className="inline-flex items-center rounded-full border border-[#0b294d] bg-[#0b294d] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
              Public
            </span>
          </div>
          <h3 className="mt-4 font-[family-name:var(--font-barlow)] text-3xl font-bold uppercase tracking-tight text-[#0b294d]">
            TEST
          </h3>
          <pre className="mt-4 overflow-x-auto rounded-[8px] border border-[#eee] bg-[#f4f7f9] p-4 font-[family-name:var(--font-geist-mono)] text-sm text-[#222]">
            HELLO WORLD XYZ
          </pre>
          <dl className="mt-6 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <div>
              <dt className="font-bold uppercase tracking-wider text-[#666]">
                Creator
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-geist-mono)] text-[#222]">
                0x308f31f4…88746d85
              </dd>
            </div>
            <div>
              <dt className="font-bold uppercase tracking-wider text-[#666]">
                drand round
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-geist-mono)] text-[#222]">
                28855312
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/capsule/${LIVE_EXAMPLE_KEY}`}
              className="inline-flex h-10 items-center justify-center rounded-[6px] bg-[#1a9e3a] px-5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#157a2c]"
            >
              {t("home.exampleViewCta")}
            </Link>
            <Link
              href="/capsules"
              className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[#0b294d] bg-white px-5 text-xs font-bold uppercase tracking-wider text-[#0b294d] transition-colors hover:bg-[#f4f7f9]"
            >
              {t("home.exampleBrowseCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: USE CASES BEYOND ALPHA ────────────────────────────────────────
function UseCasesSection({ t }: { t: TFn }) {
  const cases = [
    {
      title: t("home.useCase1Title"),
      body: t("home.useCase1Body"),
      icon: <ChartIcon />,
    },
    {
      title: t("home.useCase2Title"),
      body: t("home.useCase2Body"),
      icon: <RocketIcon />,
    },
    {
      title: t("home.useCase3Title"),
      body: t("home.useCase3Body"),
      icon: <EnvelopeIcon />,
    },
    {
      title: t("home.useCase4Title"),
      body: t("home.useCase4Body"),
      icon: <KeyIcon />,
    },
  ];

  return (
    <section className="bg-[#f4f7f9] py-20 border-b border-[#eee]">
      <div className="mx-auto max-w-5xl px-6">
        <SectionEyebrow color="brand">
          {t("home.useCasesEyebrow")}
        </SectionEyebrow>
        <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-barlow)] text-4xl font-black uppercase tracking-tight text-[#0b294d] sm:text-5xl">
          {t("home.useCasesTitle")}
        </h2>
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-[#666]">
          {t("home.useCasesSubtitle")}
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {cases.map((c, i) => (
            <div
              key={i}
              className="rounded-[14px] border border-[#eee] bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#1a9e3a] text-white">
                {c.icon}
              </div>
              <h3 className="font-[family-name:var(--font-barlow)] text-xl font-bold uppercase tracking-tight text-[#0b294d]">
                {c.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#666]">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: WHY ARKIV ─────────────────────────────────────────────────────
function WhyArkivSection({ t }: { t: TFn }) {
  const reasons = [
    { title: t("home.why1Title"), body: t("home.why1Body") },
    { title: t("home.why2Title"), body: t("home.why2Body") },
    { title: t("home.why3Title"), body: t("home.why3Body") },
    { title: t("home.why4Title"), body: t("home.why4Body") },
  ];

  return (
    <section className="bg-[#0b294d] py-20 text-white">
      <div className="mx-auto max-w-5xl px-6">
        <SectionEyebrow color="accent">{t("home.whyEyebrow")}</SectionEyebrow>
        <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-barlow)] text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
          {t("home.whyTitle")}
        </h2>

        <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {reasons.map((r, i) => (
            <div key={i} className="relative pl-8">
              <span
                className="absolute left-0 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1a9e3a] text-[10px] font-bold text-white"
                aria-hidden
              >
                ✓
              </span>
              <h3 className="font-[family-name:var(--font-barlow)] text-lg font-bold uppercase tracking-tight text-white">
                {r.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: TRUST SIGNALS ─────────────────────────────────────────────────
function TrustSection({ t }: { t: TFn }) {
  const badges = [
    t("home.trust1"),
    t("home.trust2"),
    t("home.trust3"),
    t("home.trust4"),
  ];

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {badges.map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-xs font-bold uppercase tracking-[0.15em] text-[#666]"
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-[#1a9e3a]"
                aria-hidden
              />
              {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: FOOTER ────────────────────────────────────────────────────────
function SiteFooter({ t }: { t: TFn }) {
  return (
    <footer className="bg-[#1a1f2e] py-12 text-white/70">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <svg
                viewBox="0 0 24 24"
                width="32"
                height="32"
                aria-hidden
                className="text-white"
              >
                <path
                  fill="currentColor"
                  d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Zm3 4a1.5 1.5 0 0 1 .75 2.8V19a.75.75 0 1 1-1.5 0v-2.2A1.5 1.5 0 0 1 12 14Z"
                />
              </svg>
              <span className="font-[family-name:var(--font-barlow)] text-3xl font-black uppercase leading-none text-white">
                Veil
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-white/60">
              {t("home.footerTagline")}
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-wider">
            <a
              href="https://github.com/Arkiv-Network/arkiv-ethns-builder-challenge"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              {t("home.footerLinkRepo")}
            </a>
            <a
              href="https://docs.arkiv.network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              {t("home.footerLinkArkiv")}
            </a>
            <a
              href="https://drand.love"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              {t("home.footerLinkDrand")}
            </a>
            <a
              href="https://forms.arkiv.network/ethns-arkiv-challenge"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              {t("home.footerLinkChallenge")}
            </a>
          </nav>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/40">
          {t("home.footerCopy")}
        </div>
      </div>
    </footer>
  );
}

// ─── Small bits ─────────────────────────────────────────────────────────────

function SectionEyebrow({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "brand" | "danger" | "accent";
}) {
  const colors = {
    brand: "text-[#1a9e3a]",
    danger: "text-[#e53e3e]",
    accent: "text-[#1a9e3a]",
  } as const;
  return (
    <p
      className={`font-[family-name:var(--font-geist-mono)] text-xs font-bold uppercase tracking-[0.2em] ${colors[color]}`}
    >
      {children}
    </p>
  );
}

// ─── Inline icons (no external dep) ─────────────────────────────────────────

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="currentColor"
        d="M3 3v18h18v-2H5V3H3Zm4 12h2v-6H7v6Zm4 0h2v-9h-2v9Zm4 0h2v-3h-2v3Zm4 0h2V8h-2v7Z"
      />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="currentColor"
        d="M14 2c-3 0-6 3-7 5L5 6 3 8l3 2-2 5 2 1 4-2 2 3 2-2-1-3c2-1 5-4 5-7l-4-3Zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
      />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="currentColor"
        d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v.5l8 5 8-5V6H4Zm16 2.4-7.5 4.7a1 1 0 0 1-1 0L4 8.4V18h16V8.4Z"
      />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="currentColor"
        d="M15 2a7 7 0 0 0-6.7 9L2 17.3V22h4.7l1.3-1.3v-2h2v-2h2l2.7-2.7A7 7 0 1 0 15 2Zm2 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
      />
    </svg>
  );
}
