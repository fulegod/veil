"use client";

/**
 * InheritanceIntro — narrative panel that sits above the /inheritance/new form.
 *
 * Three blocks:
 *  1. What is this? — short lede with the "dead-man's switch" framing
 *  2. Use case cards — 4 concrete scenarios. Clicking any one pre-fills
 *     the form's title field via the `onPickUseCase` callback.
 *  3. 4-step how-it-works — Configure / Seal / Distribute / Live
 *
 * Built for a first-time visitor who needs context before facing the form.
 */

import { useLanguage } from "./LanguageProvider";

export function InheritanceIntro({
  onPickUseCase,
}: {
  onPickUseCase: (sampleTitle: string) => void;
}) {
  const { t } = useLanguage();

  const useCases = [
    {
      tag: t("inh.uc1Tag"),
      title: t("inh.uc1Title"),
      body: t("inh.uc1Body"),
      sample: t("inh.uc1Sample"),
    },
    {
      tag: t("inh.uc2Tag"),
      title: t("inh.uc2Title"),
      body: t("inh.uc2Body"),
      sample: t("inh.uc2Sample"),
    },
    {
      tag: t("inh.uc3Tag"),
      title: t("inh.uc3Title"),
      body: t("inh.uc3Body"),
      sample: t("inh.uc3Sample"),
    },
    {
      tag: t("inh.uc4Tag"),
      title: t("inh.uc4Title"),
      body: t("inh.uc4Body"),
      sample: t("inh.uc4Sample"),
    },
  ];

  const steps = [
    { tag: "01", title: t("inh.step01Title"), body: t("inh.step01Body") },
    { tag: "02", title: t("inh.step02Title"), body: t("inh.step02Body") },
    { tag: "03", title: t("inh.step03Title"), body: t("inh.step03Body") },
    { tag: "04", title: t("inh.step04Title"), body: t("inh.step04Body") },
  ];

  return (
    <section className="border-2 border-black bg-black p-6 text-white md:p-8">
      {/* What is this? */}
      <div className="border-b-2 border-[#00e676] pb-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
          {t("inh.introTag")}
        </p>
        <h2 className="mt-2 text-3xl uppercase tracking-tighter md:text-4xl lg:text-5xl">
          {t("inh.introHeading")}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-snug text-gray-300 text-justify md:text-base">
          {t("inh.introLede")}
        </p>
      </div>

      {/* Use case cards */}
      <div className="mt-8">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
          [EXAMPLES — click to pre-fill the title]
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {useCases.map((uc) => (
            <button
              key={uc.tag}
              type="button"
              onClick={() => onPickUseCase(uc.sample)}
              className="group flex flex-col gap-2 border-2 border-[#00e676] bg-black p-4 text-left transition-colors hover:bg-[#00e676] hover:text-black"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676] group-hover:text-black">
                  {uc.tag}
                </span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white group-hover:text-black">
                  {t("inh.useThisCta")}
                </span>
              </div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-tight text-white group-hover:text-black md:text-base">
                {uc.title}
              </h3>
              <p className="text-xs leading-snug text-gray-300 group-hover:text-black/80 md:text-sm">
                {uc.body}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-black/60">
                e.g. &quot;{uc.sample}&quot;
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 4-step how-it-works */}
      <div className="mt-10">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00e676]">
          [{t("inh.stepsHeading").toUpperCase()}]
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.tag}
              className="flex flex-col gap-2 border-l-2 border-[#00e676] pl-4"
            >
              <span className="font-mono text-3xl font-bold tabular-nums text-[#00e676]">
                {s.tag}
              </span>
              <h4 className="font-mono text-sm font-bold uppercase tracking-widest text-white">
                {s.title}
              </h4>
              <p className="text-xs leading-snug text-gray-300 lowercase text-justify">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
