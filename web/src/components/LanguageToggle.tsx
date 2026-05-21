"use client";

import { useLanguage } from "./LanguageProvider";

export function LanguageToggle() {
  const { lang, toggle } = useLanguage();
  const next = lang === "en" ? "ES" : "EN";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch language to ${next}`}
      className="inline-flex h-9 items-center justify-center rounded-[6px] border border-[#ddd] bg-white px-2.5 font-[family-name:var(--font-geist-mono)] text-xs font-bold text-[#0b294d] transition-colors hover:border-[#0099ff] hover:text-[#0099ff]"
    >
      {next}
    </button>
  );
}
