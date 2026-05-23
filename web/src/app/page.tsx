"use client";

import Link from "next/link";
import { useAccount } from "wagmi";

import { CapsuleProtocolDiagram } from "@/components/CapsuleProtocolDiagram";
import { Header } from "@/components/Header";
import { HeroVisual } from "@/components/HeroVisual";
import { InheritanceProtocolDiagram } from "@/components/InheritanceProtocolDiagram";
import { useLanguage } from "@/components/LanguageProvider";

// Real Veil capsule on Braga used as the live example.
const LIVE_EXAMPLE_KEY =
  "0x91807c370f60f91312267f23a319f2d587b09a20b0cc502287ac1eb2081d403a";

type TFn = ReturnType<typeof useLanguage>["t"];

export default function Home() {
  const { isConnected, address } = useAccount();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col flex-1 bg-white text-black">
      <Header />
      <div className="mx-auto w-full max-w-[1280px] flex flex-col gap-6 p-4 md:p-8">
        <HeroSection isConnected={isConnected} address={address} t={t} />
        <CapsulesSection t={t} />
        <InheritanceSection t={t} />
        <LaunchAppBanner t={t} />
        <WhyArkivSection t={t} />
        <TrustSection t={t} />
        <SiteFooter t={t} />
      </div>
    </div>
  );
}

// ─── HERO ───────────────────────────────────────────────────────────────────

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
    <Section tag="[§00 — MASTHEAD]">
      <div className="grid grid-cols-12 gap-6">
        {/* Left column — copy + CTAs */}
        <div className="col-span-12 md:col-span-7">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {t("home.heroEyebrow")}
          </p>
          <h1 className="mt-3 text-5xl font-bold uppercase tracking-tighter md:text-7xl lg:text-8xl">
            <span className="block leading-[1] pb-2">
              {t("home.heroTitleA")}
            </span>
            <span className="mt-4 inline-block bg-[#00e676] px-3 leading-[1.1] [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">
              {t("home.heroTitleB")}
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-snug text-gray-700 md:text-base">
            {t("home.heroSubtitle")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {isConnected ? (
              <Link
                href="/capsule/new"
                className="border-2 border-black bg-black px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-[3px_3px_0_rgba(0,0,0,1)] transition-colors hover:bg-[#00e676] hover:text-black md:text-sm"
              >
                [{t("home.heroCtaPrimary").toUpperCase()}]
              </Link>
            ) : (
              <span className="border-2 border-dashed border-black bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-gray-500">
                [{t("home.connectFirst").toUpperCase()}]
              </span>
            )}
            <Link
              href="/capsules"
              className="border-2 border-black bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black shadow-[3px_3px_0_rgba(0,0,0,1)] transition-colors hover:bg-[#00e676] md:text-sm"
            >
              [{t("home.heroCtaSecondary").toUpperCase()}]
            </Link>
          </div>

          {/* Stack/connection meta — collapsed under copy on mobile */}
          <div className="mt-8 grid grid-cols-1 gap-4 border-t-2 border-black pt-6 md:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                [STACK]
              </p>
              <p className="mt-1 font-mono text-xs leading-snug text-gray-700">
                {t("home.heroAttribution")}
              </p>
            </div>
            {isConnected && address && (
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  [{t("common.connectedAs").toUpperCase()}]
                </p>
                <p className="mt-1 font-mono text-xs text-black">
                  {address.slice(0, 6)}…{address.slice(-4)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right column — animated SVG hero visual */}
        <div className="col-span-12 flex items-center md:col-span-5 md:border-l-2 md:border-black md:pl-6">
          <HeroVisual className="block h-auto w-full" />
        </div>
      </div>
    </Section>
  );
}

// ─── CAPSULES (first product, circuit-led) ──────────────────────────────────

function CapsulesSection({ t }: { t: TFn }) {
  const steps = [
    {
      tag: "01",
      label: "SEAL",
      title: t("home.capStep1Title"),
      body: t("home.capStep1Body"),
    },
    {
      tag: "02",
      label: "WAIT",
      title: t("home.capStep2Title"),
      body: t("home.capStep2Body"),
    },
    {
      tag: "03",
      label: "VERIFY",
      title: t("home.capStep3Title"),
      body: t("home.capStep3Body"),
    },
  ];

  const stats = [
    t("home.capStat1"),
    t("home.capStat2"),
    t("home.capStat3"),
    t("home.capStat4"),
  ];

  return (
    <Section tag="[§01 — CAPSULES]">
      {/* Header */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {t("home.capEyebrow")}
          </p>
          <h2 className="mt-2 text-3xl uppercase tracking-tighter text-black md:text-5xl lg:text-6xl">
            {t("home.capTitle")}
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-snug text-gray-700 text-justify md:text-base">
            {t("home.capLede")}
          </p>
        </div>
        <div className="col-span-12 flex flex-col gap-3 md:col-span-4 md:items-end md:text-right">
          <div className="flex flex-wrap gap-2 md:justify-end">
            {stats.map((s, i) => (
              <span
                key={i}
                className="border-2 border-black bg-white px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-black"
              >
                [{s}]
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Concept photo strip — metaphorical visualization above the technical diagram */}
      <div className="mt-10">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
          [CONCEPT — IN PICTURES]
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            {
              src: "/story/02-seal.webp",
              label: "01 · SEAL",
              alt: "Wax seal stamping a price chart — editorial woodcut",
            },
            {
              src: "/story/03-unlock.webp",
              label: "02 · WAIT",
              alt: "Sealed envelope being opened, smoke escaping — editorial woodcut",
            },
            {
              src: "/story/04-track.webp",
              label: "03 · VERIFY",
              alt: "Stack of archival folders with timestamps — editorial woodcut",
            },
          ].map((p) => (
            <figure key={p.src} className="border-2 border-black bg-black p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} className="block w-full h-auto" />
              <figcaption className="bg-white p-2 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
                {p.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Protocol diagram — SVG */}
      <div className="mt-10">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
          [PROTOCOL MAP — ENTITIES + LIFECYCLE]
        </p>
        <div className="mt-3 border-2 border-black bg-black p-3 md:p-6">
          <CapsuleProtocolDiagram className="block h-auto w-full" />
        </div>
      </div>

      {/* 3-step narrative beneath the diagram */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.tag}
            className="flex flex-col gap-2 border-l-2 border-black pl-4"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl font-bold tabular-nums text-[#00e676]">
                {s.tag}
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                [{s.label}]
              </span>
            </div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-black underline decoration-2 decoration-[#00e676] underline-offset-4">
              {s.title}
            </h3>
            <p className="text-xs leading-snug text-gray-700 lowercase text-justify">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── LAUNCH APP — separator between the two product circuit sections and the rest ─

function LaunchAppBanner({ t }: { t: TFn }) {
  return (
    <Section tag="[§03 — LAUNCH]" tagAccent>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
            {t("home.launchEyebrow")}
          </p>
          <h2 className="mt-2 text-4xl uppercase tracking-tighter md:text-6xl lg:text-7xl">
            {t("home.launchTitle")}
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-snug text-gray-700 text-justify md:text-base">
            {t("home.launchBody")}
          </p>
        </div>
        <div className="col-span-12 flex items-end md:col-span-4 md:justify-end">
          <Link
            href="/capsules"
            className="w-full border-4 border-black bg-[#00e676] px-6 py-6 text-center font-mono text-2xl font-bold uppercase tracking-widest text-black hover:bg-black hover:text-[#00e676] md:w-auto md:px-10 md:py-8 md:text-3xl"
          >
            [{t("home.launchCta").toUpperCase()} →]
          </Link>
        </div>
      </div>
    </Section>
  );
}

// ─── ORPHAN — kept temporarily until the new sections fully replace these ──

function _UnusedHowItWorksSection({ t }: { t: TFn }) {
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
    <Section tag="[§02 — HOW IT WORKS]">
      <h2 className="text-3xl uppercase tracking-tighter md:text-5xl">
        {t("home.howTitle")}
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 border-l-2 border-black pl-4"
          >
            <div className="font-mono text-3xl font-bold tabular-nums text-[#00e676]">
              {s.tag}
            </div>
            <div className="font-mono text-sm font-bold uppercase underline decoration-2 decoration-[#00e676] underline-offset-4">
              [{s.title}]
            </div>
            <p className="text-xs leading-snug text-gray-700 lowercase text-justify">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── INHERITANCE VAULTS (second product) ────────────────────────────────────

function InheritanceSection({ t }: { t: TFn }) {
  const steps = [
    {
      tag: "01",
      label: "VAULT",
      title: t("home.inhStep1Title"),
      body: t("home.inhStep1Body"),
    },
    {
      tag: "02",
      label: "HEARTBEAT",
      title: t("home.inhStep2Title"),
      body: t("home.inhStep2Body"),
    },
    {
      tag: "03",
      label: "RECOVER",
      title: t("home.inhStep3Title"),
      body: t("home.inhStep3Body"),
    },
  ];

  const stats = [
    t("home.inhStat1"),
    t("home.inhStat2"),
    t("home.inhStat3"),
    t("home.inhStat4"),
  ];

  return (
    <Section tag="[§02B — INHERITANCE VAULTS]" tagAccent inverted>
      {/* Header — eyebrow / title / lede */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
            {t("home.inhEyebrow")}
          </p>
          <h2 className="mt-2 text-3xl uppercase tracking-tighter text-white md:text-5xl lg:text-6xl">
            {t("home.inhTitle")}
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-snug text-gray-300 text-justify md:text-base">
            {t("home.inhLede")}
          </p>
        </div>
        <div className="col-span-12 flex flex-col gap-3 md:col-span-4 md:items-end md:text-right">
          <div className="flex flex-wrap gap-2 md:justify-end">
            {stats.map((s, i) => (
              <span
                key={i}
                className="border-2 border-[#00e676] bg-black px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]"
              >
                [{s}]
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Concept photo strip — metaphorical visualization above the technical diagram */}
      <div className="mt-10">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
          [CONCEPT — IN PICTURES]
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            {
              src: "/story/05-vault.webp",
              label: "01 · VAULT",
              alt: "Massive vault sealed with chains and a wax sigil — editorial woodcut",
            },
            {
              src: "/story/06-heartbeat.webp",
              label: "02 · HEARTBEAT",
              alt: "Hourglass turned by a hand against a cardiogram waveform — editorial woodcut",
            },
            {
              src: "/story/07-quorum.webp",
              label: "03 · RECOVER",
              alt: "Five wax-sealed envelopes, three opened with brass keys, recovered parchment above — editorial woodcut",
            },
          ].map((p) => (
            <figure
              key={p.src}
              className="border-2 border-[#00e676] bg-black p-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} className="block w-full h-auto" />
              <figcaption className="bg-black p-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
                {p.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Protocol diagram — SVG circuit */}
      <div className="mt-10">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
          [PROTOCOL MAP — ENTITIES + LIFECYCLE]
        </p>
        <div className="mt-3 border-2 border-[#00e676] bg-black p-3 md:p-6">
          <InheritanceProtocolDiagram className="block h-auto w-full" />
        </div>
      </div>

      {/* 3-step flow text — the diagram's narrative companion */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.tag}
            className="flex flex-col gap-2 border-l-2 border-[#00e676] pl-4"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl font-bold tabular-nums text-[#00e676]">
                {s.tag}
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
                [{s.label}]
              </span>
            </div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-white">
              {s.title}
            </h3>
            <p className="text-xs leading-snug text-gray-300 lowercase text-justify">
              {s.body}
            </p>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/inheritance"
          className="border-2 border-[#00e676] bg-[#00e676] px-6 py-4 font-mono text-base font-bold uppercase tracking-widest text-black hover:bg-black hover:text-[#00e676]"
        >
          [{t("home.inhCtaPrimary").toUpperCase()} →]
        </Link>
        <a
          href="https://github.com/fulegod/veil/blob/dev/PATTERNS.md"
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-white bg-black px-6 py-4 font-mono text-base font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black"
        >
          [{t("home.inhCtaSecondary").toUpperCase()}]
        </a>
      </div>
    </Section>
  );
}

// ─── LIVE EXAMPLE ───────────────────────────────────────────────────────────

function ExampleSection({ t }: { t: TFn }) {
  return (
    <Section tag="[§04 — LIVE EXAMPLE]" tagAccent>
      <h2 className="text-3xl uppercase tracking-tighter md:text-5xl">
        {t("home.exampleTitle")}
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-snug text-gray-700 text-justify md:text-base">
        {t("home.exampleBody")}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-0 border-2 border-black md:grid-cols-12">
        <div className="border-b-2 border-black p-4 md:col-span-7 md:border-b-0 md:border-r-2">
          <div className="flex items-center gap-2">
            <BracketBadge color="accent">UNLOCKED</BracketBadge>
            <BracketBadge color="ink">PUBLIC</BracketBadge>
          </div>
          <h3 className="mt-4 text-2xl uppercase tracking-tighter md:text-3xl">
            TEST
          </h3>
          <pre className="mt-4 overflow-x-auto border-2 border-black bg-white p-3 font-mono text-sm">
            HELLO WORLD XYZ
          </pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/capsule/${LIVE_EXAMPLE_KEY}`}
              className="border-2 border-black bg-black px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white shadow-[3px_3px_0_rgba(0,0,0,1)] transition-colors hover:bg-[#00e676] hover:text-black"
            >
              [{t("home.exampleViewCta").toUpperCase()}]
            </Link>
            <Link
              href="/capsules"
              className="border-2 border-black bg-white px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-black shadow-[3px_3px_0_rgba(0,0,0,1)] transition-colors hover:bg-[#00e676]"
            >
              [{t("home.exampleBrowseCta").toUpperCase()}]
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 md:col-span-5 md:grid-cols-1">
          <Stat label="CREATOR" mono>
            0x308f…6d85
          </Stat>
          <Stat label="DRAND ROUND" mono>
            28855312
          </Stat>
        </div>
      </div>
    </Section>
  );
}

// ─── USE CASES ──────────────────────────────────────────────────────────────

function UseCasesSection({ t }: { t: TFn }) {
  const cases = [
    {
      tag: "[ALPHA]",
      title: t("home.useCase1Title"),
      body: t("home.useCase1Body"),
      icon: <IconChart />,
      href: undefined as string | undefined,
      live: false,
    },
    {
      tag: "[FOUNDER]",
      title: t("home.useCase2Title"),
      body: t("home.useCase2Body"),
      icon: <IconRocket />,
      href: undefined,
      live: false,
    },
    {
      tag: "[PERSONAL]",
      title: t("home.useCase3Title"),
      body: t("home.useCase3Body"),
      icon: <IconEnvelope />,
      href: undefined,
      live: false,
    },
    {
      tag: "[DEAD-MAN]",
      title: t("home.useCase4Title"),
      body: t("home.useCase4Body"),
      icon: <IconClockKey />,
      // The only live-built case — clickable, badge it.
      href: "/inheritance",
      live: true,
    },
  ];

  return (
    <Section tag="[§05 — USE CASES]">
      <h2 className="text-3xl uppercase tracking-tighter md:text-5xl">
        {t("home.useCasesTitle")}
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-snug text-gray-700 text-justify md:text-base">
        {t("home.useCasesSubtitle")}
      </p>
      <div className="mt-8 grid grid-cols-1 gap-0 border-2 border-black md:grid-cols-2">
        {cases.map((c, i) => {
          const borderClasses = `${
            i % 2 === 1
              ? "border-t-2 border-black md:border-l-2 md:border-t-0"
              : ""
          } ${i >= 2 ? "md:border-t-2 md:border-black" : ""}`;
          const baseClasses = `group flex flex-col gap-3 p-5 transition-colors hover:bg-[#00e676]/10 ${borderClasses}`;

          const content = (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
                    {c.tag}
                  </div>
                  {c.live && (
                    <span className="border-2 border-black bg-[#00e676] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-black">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="h-10 w-10 border-2 border-black bg-white p-1.5 text-black transition-colors group-hover:bg-black group-hover:text-[#00e676]">
                  {c.icon}
                </div>
              </div>
              <h3 className="text-base font-bold uppercase tracking-tight">
                {c.title}
                {c.live && (
                  <span className="ml-2 font-mono text-xs font-bold text-[#00e676]">
                    →
                  </span>
                )}
              </h3>
              <p className="text-xs leading-snug text-gray-700 lowercase text-justify">
                {c.body}
              </p>
            </>
          );

          return c.href ? (
            <Link key={i} href={c.href} className={baseClasses}>
              {content}
            </Link>
          ) : (
            <div key={i} className={baseClasses}>
              {content}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ─── WHY ARKIV ──────────────────────────────────────────────────────────────

function WhyArkivSection({ t }: { t: TFn }) {
  const reasons = [
    { title: t("home.why1Title"), body: t("home.why1Body") },
    { title: t("home.why2Title"), body: t("home.why2Body") },
    { title: t("home.why3Title"), body: t("home.why3Body") },
    { title: t("home.why4Title"), body: t("home.why4Body") },
  ];

  return (
    <Section tag="[§06 — WHY ARKIV]" tagAccent inverted>
      <h2 className="text-3xl uppercase tracking-tighter text-white md:text-5xl">
        {t("home.whyTitle")}
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {reasons.map((r, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 border-l-4 border-[#00e676] pl-4"
          >
            <h3 className="text-sm font-bold uppercase tracking-tight text-white">
              [{String(i + 1).padStart(2, "0")}] {r.title}
            </h3>
            <p className="text-xs leading-snug text-gray-400 lowercase text-justify">
              {r.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── TRUST SIGNALS ──────────────────────────────────────────────────────────

function TrustSection({ t }: { t: TFn }) {
  const badges = [
    t("home.trust1"),
    t("home.trust2"),
    t("home.trust3"),
    t("home.trust4"),
  ];

  return (
    <section className="border-2 border-black p-4">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[10px] font-bold uppercase tracking-widest">
        {badges.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 bg-[#00e676]" aria-hidden />
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}

// ─── FOOTER ─────────────────────────────────────────────────────────────────

function SiteFooter({ t }: { t: TFn }) {
  return (
    <footer className="mt-4 flex flex-col items-center justify-between gap-4 border-t-2 border-black pt-4 text-xs font-bold uppercase text-gray-500 md:flex-row">
      <div>{t("home.footerCopy")} · SYS.OP.OK</div>
      <nav className="flex flex-wrap gap-x-4 gap-y-2">
        <Link
          href="/capsules"
          className="underline decoration-2 decoration-[#00e676] underline-offset-4 hover:text-black"
        >
          {t("home.exampleBrowseCta")}
        </Link>
        <Link
          href="/inheritance"
          className="underline decoration-2 decoration-[#00e676] underline-offset-4 hover:text-black"
        >
          {t("inh.navLink")}
        </Link>
        <Link
          href="/case-files"
          className="underline decoration-2 decoration-[#00e676] underline-offset-4 hover:text-black"
        >
          {t("cf.navLink")}
        </Link>
        <FooterLink href="https://github.com/fulegod/veil">
          {t("home.footerLinkRepo")}
        </FooterLink>
        <FooterLink href="https://docs.arkiv.network">
          {t("home.footerLinkArkiv")}
        </FooterLink>
        <FooterLink href="https://drand.love">
          {t("home.footerLinkDrand")}
        </FooterLink>
        <FooterLink href="https://forms.arkiv.network/ethns-arkiv-challenge">
          {t("home.footerLinkChallenge")}
        </FooterLink>
      </nav>
    </footer>
  );
}

// ─── Building blocks ────────────────────────────────────────────────────────

function Section({
  tag,
  tagAccent,
  tagInverted,
  inverted,
  children,
}: {
  tag: string;
  tagAccent?: boolean;
  tagInverted?: boolean;
  inverted?: boolean;
  children: React.ReactNode;
}) {
  const tagClass = tagAccent
    ? "bg-[#00e676] text-black"
    : tagInverted
      ? "bg-white text-black border-r-2 border-b-2 border-black"
      : "bg-black text-white";
  const sectionClass = inverted
    ? "border-2 border-black bg-black p-6 md:p-12 relative"
    : "border-2 border-black bg-white p-6 md:p-12 relative";
  return (
    <section className={sectionClass}>
      <div
        className={`absolute top-0 left-0 ${tagClass} px-2 py-1 text-[10px] uppercase font-bold tracking-widest`}
      >
        {tag}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function BracketBadge({
  color,
  children,
}: {
  color: "accent" | "ink";
  children: React.ReactNode;
}) {
  const cls =
    color === "accent" ? "bg-[#00e676] text-black" : "bg-black text-white";
  return (
    <span
      className={`${cls} inline-block px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest`}
    >
      [{children}]
    </span>
  );
}

function Stat({
  label,
  mono,
  children,
}: {
  label: string;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b-2 border-black p-4 last:border-b-0 md:p-5">
      <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
        [{label}]
      </div>
      <div
        className={`mt-1 ${
          mono ? "font-mono text-xs md:text-sm" : "text-lg font-bold"
        } break-all text-black`}
      >
        {children}
      </div>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="border-b-2 border-black text-black no-underline hover:border-[#00e676] hover:text-[#00e676]"
    >
      [{children}]
    </a>
  );
}

// ─── Case File — newspaper-style narrative scenario ────────────────────────

function CaseFileSection({ t }: { t: TFn }) {
  const tl = [
    {
      date: t("home.caseT1Date"),
      label: t("home.caseT1Label"),
      body: t("home.caseT1Body"),
      img: "/story/02-seal.webp",
      imgAlt:
        "Editorial woodcut illustration — a hand pressing a brass stamp onto a wax seal over a printed chart",
    },
    {
      date: t("home.caseT2Date"),
      label: t("home.caseT2Label"),
      body: t("home.caseT2Body"),
      img: "/story/03-unlock.webp",
      imgAlt:
        "Editorial woodcut illustration — a wax-sealed envelope torn open with ribbons of light and smoke escaping",
    },
    {
      date: t("home.caseT3Date"),
      label: t("home.caseT3Label"),
      body: t("home.caseT3Body"),
      img: "/story/04-track.webp",
      imgAlt:
        "Editorial woodcut illustration — a stack of archival folders next to a steel filing cabinet, evidence locker aesthetic",
    },
  ];

  return (
    <Section tag="[§03 — CASE FILE]" tagAccent>
      {/* Top stamp row — eyebrow + byline + date */}
      <div className="border-b-2 border-black pb-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
          {t("home.caseEyebrow")}
        </p>
        <p className="mt-1 font-mono text-xs font-bold uppercase tracking-widest">
          {t("home.caseByline")} · {t("home.caseDate")}
        </p>
      </div>

      {/* Hero portrait + headline + lede — broadsheet feature shape */}
      <div className="mt-6 grid grid-cols-12 gap-6">
        <figure className="col-span-12 md:col-span-5">
          <div className="border-2 border-black bg-black p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/story/01-analyst.webp"
              alt="K-31, an anonymous crypto analyst silhouetted at a desk in Singapore at night — editorial black-and-white woodcut illustration with neon green accent on the laptop screen"
              className="block w-full h-auto"
            />
          </div>
          <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-widest text-gray-500">
            ↳ K-31, 03:47 local time. Singapore.
          </figcaption>
        </figure>

        <div className="col-span-12 md:col-span-7">
          <h2 className="text-3xl uppercase leading-[1.05] tracking-tighter md:text-4xl lg:text-5xl">
            {t("home.caseHeadline")}
          </h2>
          <p className="mt-4 columns-1 text-sm leading-relaxed text-gray-700 text-justify md:columns-2 md:gap-6 md:text-base">
            {t("home.caseLede")}
          </p>
        </div>
      </div>

      {/* Pull-quote-style subhead block */}
      <div className="mt-8 border-2 border-black bg-white p-5 md:p-8">
        <h3 className="font-mono text-sm font-bold uppercase tracking-widest md:text-base">
          <span className="bg-[#00e676] px-1.5 text-black">
            {t("home.caseSubhead").toUpperCase()}
          </span>
        </h3>
        <p className="mt-4 columns-1 text-sm leading-relaxed text-gray-700 text-justify md:columns-2 md:gap-8 md:text-base">
          {t("home.caseSubbody")}
        </p>
      </div>

      {/* Outcome — high-contrast inverted block */}
      <div className="mt-8 grid grid-cols-12 gap-0 border-2 border-black">
        <div className="col-span-12 bg-black p-6 text-white md:col-span-7 md:p-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
            [OUTCOME]
          </p>
          <h3 className="mt-2 text-2xl uppercase leading-[1.1] tracking-tighter md:text-3xl">
            {t("home.caseOutcomeHead")}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-gray-300 text-justify md:text-base">
            {t("home.caseOutcomeBody")}
          </p>
        </div>
        <figure className="col-span-12 border-t-2 border-black md:col-span-5 md:border-l-2 md:border-t-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/story/04-track.webp"
            alt="K-31's archived track record — folders with green timestamps anyone can verify"
            className="block w-full h-auto"
          />
        </figure>
      </div>

      {/* Timeline + 3-step photo strip */}
      <div className="mt-8">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
          {t("home.caseTimelineHeader")}
        </p>
        <TimelineSVG />
        <div className="mt-4 grid grid-cols-1 gap-0 border-2 border-black md:grid-cols-3">
          {tl.map((step, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                i > 0
                  ? "border-t-2 border-black md:border-l-2 md:border-t-0"
                  : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={step.img}
                alt={step.imgAlt}
                className="block aspect-[4/3] w-full object-cover border-b-2 border-black"
              />
              <div className="flex flex-col gap-2 p-4">
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {step.date}
                </div>
                <div className="font-mono text-xs font-bold uppercase tracking-widest">
                  <span className="bg-black px-1.5 py-0.5 text-[#00e676]">
                    [{step.label}]
                  </span>
                </div>
                <p className="text-xs leading-snug text-gray-700 lowercase text-justify">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 border-t border-dashed border-gray-400 pt-3 font-mono text-[10px] uppercase tracking-widest text-gray-500">
        ⚑ {t("home.caseFootnote")}
      </p>
    </Section>
  );
}

// Pure SVG timeline — 3 nodes connected by a horizontal line with dashed
// "wait" segment in the middle. All 2px, all black + accent green.
function TimelineSVG() {
  return (
    <svg
      viewBox="0 0 800 80"
      className="mt-4 h-20 w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Seal → Unlock → Verify timeline"
    >
      {/* main horizontal line */}
      <line x1="60" y1="40" x2="400" y2="40" stroke="#000" strokeWidth="2" />
      {/* dashed wait segment */}
      <line
        x1="400"
        y1="40"
        x2="540"
        y2="40"
        stroke="#000"
        strokeWidth="2"
        strokeDasharray="6 6"
      />
      <line x1="540" y1="40" x2="740" y2="40" stroke="#000" strokeWidth="2" />

      {/* node 1: SEAL — filled black square */}
      <rect x="50" y="30" width="20" height="20" fill="#000" />
      <text
        x="60"
        y="20"
        textAnchor="middle"
        fontFamily="ui-monospace, 'JetBrains Mono', monospace"
        fontSize="10"
        fontWeight="700"
        fill="#000"
      >
        [SEAL]
      </text>

      {/* node 2: UNLOCK — green-filled square w/ black border */}
      <rect
        x="390"
        y="30"
        width="20"
        height="20"
        fill="#00e676"
        stroke="#000"
        strokeWidth="2"
      />
      <text
        x="400"
        y="20"
        textAnchor="middle"
        fontFamily="ui-monospace, 'JetBrains Mono', monospace"
        fontSize="10"
        fontWeight="700"
        fill="#000"
      >
        [UNLOCK]
      </text>

      {/* node 3: VERIFY — outlined square */}
      <rect
        x="730"
        y="30"
        width="20"
        height="20"
        fill="#fff"
        stroke="#000"
        strokeWidth="2"
      />
      <text
        x="740"
        y="20"
        textAnchor="middle"
        fontFamily="ui-monospace, 'JetBrains Mono', monospace"
        fontSize="10"
        fontWeight="700"
        fill="#000"
      >
        [VERIFY]
      </text>

      {/* label between unlock and verify */}
      <text
        x="470"
        y="65"
        textAnchor="middle"
        fontFamily="ui-monospace, 'JetBrains Mono', monospace"
        fontSize="9"
        fontWeight="700"
        fill="#666"
      >
        drand publishes
      </text>
      <text
        x="220"
        y="65"
        textAnchor="middle"
        fontFamily="ui-monospace, 'JetBrains Mono', monospace"
        fontSize="9"
        fontWeight="700"
        fill="#666"
      >
        ciphertext on Arkiv
      </text>
      <text
        x="640"
        y="65"
        textAnchor="middle"
        fontFamily="ui-monospace, 'JetBrains Mono', monospace"
        fontSize="9"
        fontWeight="700"
        fill="#666"
      >
        on-chain reveal
      </text>
    </svg>
  );
}

// ─── Custom brutalist icons (2px stroke, no fill) ──────────────────────────
// Each: 24×24 viewBox, currentColor stroke so it inherits parent color.

function IconChart() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden
    >
      <path d="M3 21V3M3 21h18" />
      <path d="M7 17v-4M11 17v-7M15 17v-5M19 17V8" />
      <path d="M5 6l14-3" />
    </svg>
  );
}

function IconRocket() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden
    >
      <path d="M12 3c4 0 7 3 7 9l-3 3h-8l-3-3c0-6 3-9 7-9z" />
      <circle cx="12" cy="10" r="1.5" fill="currentColor" />
      <path d="M9 18l-2 3M15 18l2 3M12 18v3" />
    </svg>
  );
}

function IconEnvelope() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" />
      <path d="M3 5l9 7 9-7" />
      <circle cx="18" cy="18" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconClockKey() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 2" />
      <path d="M12 4v1M12 19v1M4 12h1M19 12h1" />
    </svg>
  );
}
