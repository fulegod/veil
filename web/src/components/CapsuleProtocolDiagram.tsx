"use client";

/**
 * CapsuleProtocolDiagram — SVG circuit diagram, i18n-aware.
 */

import { InlineIcon } from "./BrutalistIcons";
import { useLanguage } from "./LanguageProvider";

const GREEN = "#00e676";
const WHITE = "#ffffff";
const STROKE = 2;

export function CapsuleProtocolDiagram({
  className = "",
}: {
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <svg
      viewBox="0 0 800 560"
      className={className}
      role="img"
      aria-labelledby="capsule-diagram-title"
    >
      <title id="capsule-diagram-title">
        Capsule protocol — entities and lifecycle
      </title>

      <defs>
        <marker
          id="arrCap"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={GREEN} />
        </marker>
      </defs>

      {/* WRITER */}
      <g>
        <rect
          x="40"
          y="60"
          width="160"
          height="64"
          fill="black"
          stroke={GREEN}
          strokeWidth={STROKE}
        />
        <InlineIcon name="person" x={50} y={70} size={28} color={GREEN} />
        <text
          x="135"
          y="88"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          [§ {t("diag.writer")}]
        </text>
        <text
          x="135"
          y="106"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
          textAnchor="middle"
        >
          {t("diag.creatorImmutable")}
        </text>
      </g>

      {/* createEntity arrow */}
      <g>
        <line
          x1="200"
          y1="92"
          x2="320"
          y2="92"
          stroke={GREEN}
          strokeWidth={STROKE}
          markerEnd="url(#arrCap)"
        />
        <text
          x="260"
          y="82"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          textAnchor="middle"
        >
          createEntity
        </text>
      </g>

      {/* CAPSULE */}
      <g>
        <rect
          x="320"
          y="40"
          width="280"
          height="180"
          fill="black"
          stroke={GREEN}
          strokeWidth={STROKE}
        />
        <InlineIcon name="lock" x={335} y={52} size={24} color={GREEN} />
        <text
          x="475"
          y="68"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          [§ {t("diag.capsule")}]
        </text>
        <text
          x="340"
          y="100"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
        >
          kind = capsule
        </text>
        <text
          x="340"
          y="120"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
        >
          payload = drand(plaintext)
        </text>
        <text
          x="340"
          y="140"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
        >
          unlock_round = N
        </text>
        <text
          x="340"
          y="160"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
        >
          expiresIn = 1y past unlock
        </text>
        <text
          x="460"
          y="200"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
        >
          {t("diag.gateSingle")}
        </text>
      </g>

      {/* arrow down */}
      <g>
        <line
          x1="460"
          y1="220"
          x2="460"
          y2="290"
          stroke={GREEN}
          strokeWidth={STROKE}
          markerEnd="url(#arrCap)"
        />
        <text
          x="475"
          y="248"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          {t("diag.drandPublishes")}
        </text>
        <text
          x="475"
          y="266"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          → {t("diag.keyDerivable")}
        </text>
      </g>

      {/* PLAINTEXT (dashed) */}
      <g>
        <rect
          x="320"
          y="300"
          width="280"
          height="64"
          fill="black"
          stroke={GREEN}
          strokeWidth={STROKE}
          strokeDasharray="6 4"
        />
        <text
          x="460"
          y="328"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
        >
          {t("diag.plaintext")}
        </text>
        <text
          x="460"
          y="346"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          textAnchor="middle"
        >
          {t("diag.plaintextNote")}
        </text>
      </g>

      {/* publishReveal arrow */}
      <g>
        <line
          x1="460"
          y1="364"
          x2="460"
          y2="430"
          stroke={GREEN}
          strokeWidth={STROKE}
          markerEnd="url(#arrCap)"
        />
        <text
          x="475"
          y="396"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          {t("diag.firstDecrypter")}
        </text>
        <text
          x="475"
          y="412"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          {t("diag.aRevealOnlyHash")}
        </text>
      </g>

      {/* REVEAL */}
      <g>
        <rect
          x="280"
          y="430"
          width="360"
          height="100"
          fill={GREEN}
          stroke={GREEN}
          strokeWidth={STROKE}
        />
        <InlineIcon name="envelope" x={295} y={442} size={24} color="black" />
        <text
          x="475"
          y="458"
          fill="black"
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          [§ {t("diag.reveal")}]
        </text>
        <text
          x="300"
          y="480"
          fill="black"
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
        >
          kind = reveal
        </text>
        <text
          x="300"
          y="498"
          fill="black"
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
        >
          payload = sha-256(plaintext)
        </text>
        <text
          x="300"
          y="516"
          fill="black"
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
        >
          capsule_key → Capsule.entityKey
        </text>
      </g>

      {/* Timeline */}
      <g>
        <line
          x1="660"
          y1="60"
          x2="660"
          y2="530"
          stroke={GREEN}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text
          x="675"
          y="80"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          fontWeight="bold"
        >
          {t("diag.timeline")}
        </text>
        <text
          x="675"
          y="120"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          t = 0
        </text>
        <text
          x="675"
          y="134"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          {t("diag.tSeal")}
        </text>
        <text
          x="675"
          y="240"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          t = unlock
        </text>
        <text
          x="675"
          y="254"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          {t("diag.tWait")}
        </text>
        <text
          x="675"
          y="460"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          t &gt; unlock
        </text>
        <text
          x="675"
          y="474"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          {t("diag.tVerify")}
        </text>
      </g>
    </svg>
  );
}
