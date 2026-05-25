"use client";

/**
 * /setup — dedicated onboarding page for first-time visitors.
 *
 * Same BragaOnboarding component as the inline banners, just in "full" variant
 * with a header, an intro paragraph, and a FAQ underneath. Linked from the
 * main nav so judges or curious visitors can find it without poking around.
 */

import Link from "next/link";

import { BragaOnboarding } from "@/components/BragaOnboarding";
import { Header } from "@/components/Header";
import { useLanguage } from "@/components/LanguageProvider";

export default function SetupPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col flex-1 bg-white text-black">
      <Header />
      <div className="mx-auto w-full max-w-[1280px] flex flex-col gap-6 p-4 md:p-8">
        <BragaOnboarding variant="full" />

        {/* FAQ */}
        <section className="border-2 border-black bg-white p-6 md:p-10">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
            [§ FAQ]
          </p>
          <h2 className="mt-2 text-2xl uppercase tracking-tighter text-black md:text-3xl">
            {t("setup.faqTitle")}
          </h2>

          <dl className="mt-4 flex flex-col gap-4">
            <FaqItem
              q={t("setup.faqWhatBragaQ")}
              a={t("setup.faqWhatBragaA")}
            />
            <FaqItem
              q={t("setup.faqWhyTestnetQ")}
              a={t("setup.faqWhyTestnetA")}
            />
            <FaqItem q={t("setup.faqMetamaskQ")} a={t("setup.faqMetamaskA")} />
            <FaqItem q={t("setup.faqGasQ")} a={t("setup.faqGasA")} />
            <FaqItem q={t("setup.faqMainnetQ")} a={t("setup.faqMainnetA")} />
          </dl>

          <div className="mt-6 flex flex-wrap gap-3 border-t-2 border-black pt-4">
            <Link
              href="/capsule/new"
              className="border-2 border-black bg-black px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-[#00e676] hover:bg-[#00e676] hover:text-black"
            >
              [{t("setup.ctaCapsule")} →]
            </Link>
            <Link
              href="/inheritance/new"
              className="border-2 border-black bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black hover:bg-[#00e676]"
            >
              [{t("setup.ctaVault")} →]
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-l-4 border-[#00e676] pl-4">
      <dt className="font-mono text-sm font-bold uppercase tracking-tight text-black">
        {q}
      </dt>
      <dd className="mt-1 text-xs leading-snug text-gray-700 md:text-sm">
        {a}
      </dd>
    </div>
  );
}
