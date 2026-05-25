"use client";

/**
 * /case-files — illustrated companion to the technical diagrams.
 *
 * Two sections:
 *   1. K-31 — the verifiable-alpha story (4 woodcuts: analyst, seal, unlock, track)
 *   2. Inheritance protocol visualized (3 woodcuts: vault, heartbeat, quorum)
 *
 * The home page deliberately leads with circuit diagrams (technical); this
 * page is where the emotional / metaphorical illustrations live, so each
 * visual has its proper context instead of competing with the protocol
 * explanations on the landing.
 */

import { Header } from "@/components/Header";
import { useLanguage } from "@/components/LanguageProvider";

export default function CaseFilesPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col flex-1 bg-white text-black">
      <Header />
      <div className="mx-auto w-full max-w-[1280px] flex flex-col gap-6 p-4 md:p-8">
        {/* Page header */}
        <section className="border-2 border-black bg-white p-6 md:p-10 relative">
          <div className="absolute top-0 left-0 bg-black text-white px-2 py-1 text-[10px] uppercase font-bold tracking-widest">
            [{t("cf.tag00")}]
          </div>
          <div className="mt-6">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {t("cf.pageEyebrow")}
            </p>
            <h1 className="mt-2 text-5xl font-bold uppercase tracking-tighter md:text-7xl">
              {t("cf.pageTitle")}
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-snug text-gray-700 text-justify md:text-base">
              {t("cf.pageLede")}
            </p>
          </div>
        </section>

        <K31CaseFile />
        <InheritanceProtocolPictures />
      </div>
    </div>
  );
}

// ─── K-31 case file — uses the 4 original woodcuts from /story/ ────────────

function K31CaseFile() {
  const { t } = useLanguage();

  return (
    <section className="border-2 border-black bg-white p-6 md:p-10 relative">
      <div className="absolute top-0 left-0 bg-[#00e676] text-black px-2 py-1 text-[10px] uppercase font-bold tracking-widest">
        {t("cf.section1Tag")}
      </div>

      <div className="mt-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
          {t("home.caseEyebrow")}
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-gray-500">
          {t("home.caseByline")} · {t("home.caseDate")}
        </p>
      </div>

      {/* Hero portrait + headline */}
      <div className="mt-6 grid grid-cols-12 gap-6">
        <figure className="col-span-12 md:col-span-5">
          <div className="border-2 border-black bg-black p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/story/01-analyst.webp"
              alt="K-31, an anonymous crypto analyst silhouetted at a desk in Singapore at night — editorial woodcut"
              className="block w-full h-auto"
            />
          </div>
          <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-widest text-gray-500">
            ↳ {t("cf.k31Caption")}
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

      {/* Subhead block */}
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

      {/* Outcome */}
      <div className="mt-8 grid grid-cols-12 gap-0 border-2 border-black">
        <div className="col-span-12 bg-black p-6 text-white md:col-span-7 md:p-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
            [{t("cf.outcome")}]
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
            alt="K-31's archived track record — folders with timestamps"
            className="block w-full h-auto"
          />
        </figure>
      </div>

      {/* 2-photo strip — seal + unlock */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <figure className="border-2 border-black bg-black p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/story/02-seal.webp"
            alt="Wax seal stamping a chart — editorial woodcut"
            className="block w-full h-auto"
          />
          <figcaption className="bg-white p-3 font-mono text-[10px] uppercase tracking-widest text-gray-700">
            [{t("home.caseT1Label")}] {t("home.caseT1Body")}
          </figcaption>
        </figure>
        <figure className="border-2 border-black bg-black p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/story/03-unlock.webp"
            alt="Envelope being opened with smoke escaping — editorial woodcut"
            className="block w-full h-auto"
          />
          <figcaption className="bg-white p-3 font-mono text-[10px] uppercase tracking-widest text-gray-700">
            [{t("home.caseT2Label")}] {t("home.caseT2Body")}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

// ─── Inheritance protocol pictures — 3 woodcuts with technical captions ───

function InheritanceProtocolPictures() {
  const { t } = useLanguage();

  const pictures = [
    {
      src: "/story/05-vault.webp",
      label: t("cf.proto01Label"),
      caption: t("cf.proto01Caption"),
      alt: "Massive vault sealed with chains and a wax sigil — editorial woodcut",
    },
    {
      src: "/story/06-heartbeat.webp",
      label: t("cf.proto02Label"),
      caption: t("cf.proto02Caption"),
      alt: "Hourglass turned by a hand against a cardiogram waveform — editorial woodcut",
    },
    {
      src: "/story/07-quorum.webp",
      label: t("cf.proto03Label"),
      caption: t("cf.proto03Caption"),
      alt: "Five wax-sealed envelopes, three opened with brass keys, recovered parchment above — editorial woodcut",
    },
  ];

  return (
    <section className="border-2 border-black bg-black p-6 text-white md:p-10 relative">
      <div className="absolute top-0 left-0 bg-[#00e676] text-black px-2 py-1 text-[10px] uppercase font-bold tracking-widest">
        {t("cf.section2Tag")}
      </div>

      <div className="mt-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
          {t("cf.section2Eyebrow")}
        </p>
        <h2 className="mt-2 text-3xl uppercase tracking-tighter md:text-4xl lg:text-5xl">
          {t("cf.section2Title")}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-snug text-gray-300 text-justify md:text-base">
          {t("cf.section2Lede")}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {pictures.map((p) => (
          <figure
            key={p.src}
            className="flex flex-col gap-3 border-2 border-[#00e676] bg-black p-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt={p.alt} className="block w-full h-auto" />
            <div className="px-1 pb-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
                {p.label}
              </p>
              <p className="mt-2 text-xs leading-snug text-gray-300 text-justify md:text-sm">
                {p.caption}
              </p>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
