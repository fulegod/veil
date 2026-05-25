"use client";

/**
 * TriggerTypes — 4-card showcase of what can be programmed as an action
 * inside a Vault. Status badge per card communicates roadmap honesty:
 *
 *   [LIVE]      Secret recovery via Shamir M-of-N → fully working today
 *   [LIVE]      Email delivery via Resend cron → backend wired end-to-end
 *   [LIVE]      Document drop via encrypted Storage URL → wired end-to-end
 *   [ROADMAP]   Wallet transfer → needs account abstraction / pre-signed tx
 *
 * Visual-only — no interactivity. Purpose is to communicate that the
 * Vault is a generic carrier for multiple trigger types, not just
 * "share recovery". This is what makes Veil "programmable trust"
 * instead of "another inheritance app".
 */

import {
  DocumentGlyph,
  EnvelopeGlyph,
  KeyGlyph,
  PersonGlyph,
} from "./BrutalistIcons";
import { useLanguage } from "./LanguageProvider";

type Status = "LIVE" | "SOON" | "ROADMAP";

const STATUS_STYLES: Record<Status, string> = {
  LIVE: "bg-[#00e676] text-black border-black",
  SOON: "bg-black text-[#00e676] border-[#00e676]",
  ROADMAP: "bg-white text-black border-black",
};

export function TriggerTypes() {
  const { t } = useLanguage();

  const triggers: Array<{
    icon: React.ReactNode;
    title: string;
    sub: string;
    status: Status;
  }> = [
    {
      icon: <KeyGlyph size={32} className="text-[#00e676]" />,
      title: t("trigger.secretTitle"),
      sub: t("trigger.secretSub"),
      status: "LIVE",
    },
    {
      icon: <EnvelopeGlyph size={32} className="text-[#00e676]" />,
      title: t("trigger.emailTitle"),
      sub: t("trigger.emailSub"),
      status: "LIVE",
    },
    {
      icon: <DocumentGlyph size={32} className="text-[#00e676]" />,
      title: t("trigger.docTitle"),
      sub: t("trigger.docSub"),
      status: "LIVE",
    },
    {
      icon: <PersonGlyph size={32} className="text-[#00e676]" />,
      title: t("trigger.transferTitle"),
      sub: t("trigger.transferSub"),
      status: "ROADMAP",
    },
  ];

  return (
    <section className="border-2 border-black bg-white p-6 md:p-8">
      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500">
        [PROGRAMMABLE TRIGGERS]
      </p>
      <h2 className="mt-2 text-2xl uppercase tracking-tighter text-black md:text-3xl lg:text-4xl">
        Four trigger types. One Vault.
      </h2>
      <p className="mt-3 max-w-3xl text-xs leading-snug text-gray-700 text-justify md:text-sm">
        A single Vault can carry multiple scheduled actions — emails, transfers,
        document drops — each with its own recipient and timer. While you sign
        your heartbeat, nothing fires.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-0 border-2 border-black md:grid-cols-2 lg:grid-cols-4">
        {triggers.map((tr, i) => {
          const borderClass = `${
            i % 2 === 1 ? "md:border-l-2 md:border-black" : ""
          } ${i >= 2 ? "border-t-2 border-black md:border-t-2" : ""} ${
            i > 0 ? "lg:border-l-2 lg:border-black lg:border-t-0" : ""
          }`;
          return (
            <article
              key={tr.title}
              className={`flex flex-col gap-3 p-4 ${borderClass}`}
            >
              <div className="flex items-start justify-between gap-2">
                {tr.icon}
                <span
                  className={`border-2 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${STATUS_STYLES[tr.status]}`}
                >
                  {tr.status}
                </span>
              </div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-tight text-black">
                {tr.title}
              </h3>
              <p className="text-xs leading-snug text-gray-700 lowercase text-justify">
                {tr.sub}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
