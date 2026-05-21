"use client";

import { useLanguage } from "./LanguageProvider";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex border-2 border-black bg-white font-mono text-xs font-bold uppercase tracking-widest select-none">
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={
          lang === "en"
            ? "bg-black px-3 py-1.5 text-[#00e676]"
            : "bg-white px-3 py-1.5 text-black transition-colors hover:bg-[#00e676]"
        }
      >
        [EN]
      </button>
      <button
        type="button"
        onClick={() => setLang("es")}
        aria-pressed={lang === "es"}
        className={
          lang === "es"
            ? "border-l-2 border-black bg-black px-3 py-1.5 text-[#00e676]"
            : "border-l-2 border-black bg-white px-3 py-1.5 text-black transition-colors hover:bg-[#00e676]"
        }
      >
        [ES]
      </button>
    </div>
  );
}
