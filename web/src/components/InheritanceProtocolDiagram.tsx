"use client";

/**
 * InheritanceProtocolDiagram — SVG circuit-style diagram.
 *
 * v2: i18n-aware (uses LanguageProvider's `t`) + self-loop redesigned as
 * a separate boxed action on the right side (was a curve that overlapped
 * its own labels in the previous version).
 */

import { InlineIcon } from "./BrutalistIcons";
import { useLanguage } from "./LanguageProvider";

const GREEN = "#00e676";
const WHITE = "#ffffff";
const STROKE = 2;

export function InheritanceProtocolDiagram({
  className = "",
}: {
  className?: string;
}) {
  const { t } = useLanguage();

  return (
    <svg
      viewBox="0 0 900 760"
      className={className}
      role="img"
      aria-labelledby="protocol-diagram-title"
    >
      <title id="protocol-diagram-title">
        Inheritance protocol — entities and lifecycle
      </title>

      <defs>
        <marker
          id="arr"
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

      {/* OWNER */}
      <g>
        <rect
          x="40"
          y="40"
          width="160"
          height="64"
          fill="black"
          stroke={GREEN}
          strokeWidth={STROKE}
        />
        <InlineIcon name="person" x={50} y={50} size={28} color={GREEN} />
        <text
          x="135"
          y="68"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          [§ {t("diag.owner")}]
        </text>
        <text
          x="135"
          y="86"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
          textAnchor="middle"
        >
          {t("diag.creatorOwner")}
        </text>
      </g>

      {/* OWNER → VAULT */}
      <g>
        <line
          x1="200"
          y1="72"
          x2="320"
          y2="72"
          stroke={GREEN}
          strokeWidth={STROKE}
          markerEnd="url(#arr)"
        />
        <text
          x="260"
          y="62"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          textAnchor="middle"
        >
          createEntity
        </text>
      </g>

      {/* VAULT */}
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
        <InlineIcon name="vault" x={335} y={52} size={24} color={GREEN} />
        <text
          x="475"
          y="68"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          [§ {t("diag.vault")}]
        </text>
        <text
          x="340"
          y="100"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
        >
          kind = vault
        </text>
        <text
          x="340"
          y="120"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
        >
          payload = drand(secret)
        </text>
        <text
          x="340"
          y="140"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
        >
          expiresIn = heartbeat
        </text>
        <text
          x="340"
          y="160"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
        >
          threshold, total_shares
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
          {t("diag.gate1")}
        </text>
      </g>

      {/* ── HEARTBEAT control box on the right of the VAULT ── */}
      <g>
        {/* arrow VAULT → control box (top) */}
        <line
          x1="600"
          y1="90"
          x2="660"
          y2="90"
          stroke={GREEN}
          strokeWidth={STROKE}
          markerEnd="url(#arr)"
        />
        {/* arrow control box → VAULT (bottom) */}
        <line
          x1="660"
          y1="170"
          x2="600"
          y2="170"
          stroke={GREEN}
          strokeWidth={STROKE}
          markerEnd="url(#arr)"
        />
        {/* control box */}
        <rect
          x="660"
          y="50"
          width="200"
          height="160"
          fill="black"
          stroke={GREEN}
          strokeWidth={STROKE}
        />
        <text
          x="760"
          y="80"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
        >
          {t("diag.extendEntity")}
        </text>
        <text
          x="760"
          y="108"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          {t("diag.proofOfLife")}
        </text>
        <text
          x="760"
          y="138"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          textAnchor="middle"
        >
          ({t("diag.ownerOnly")})
        </text>
        <text
          x="760"
          y="170"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          textAnchor="middle"
        >
          {t("diag.heartbeatReset")}
        </text>
      </g>

      {/* Arrows: VAULT → 3 SHARES (vault_key) */}
      <g>
        <line
          x1="380"
          y1="220"
          x2="180"
          y2="330"
          stroke={GREEN}
          strokeWidth={STROKE}
          markerEnd="url(#arr)"
        />
        <line
          x1="460"
          y1="220"
          x2="400"
          y2="330"
          stroke={GREEN}
          strokeWidth={STROKE}
          markerEnd="url(#arr)"
        />
        <line
          x1="540"
          y1="220"
          x2="620"
          y2="330"
          stroke={GREEN}
          strokeWidth={STROKE}
          markerEnd="url(#arr)"
        />
        <text
          x="460"
          y="278"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          textAnchor="middle"
        >
          {t("diag.sharedAttr")}
        </text>
      </g>

      {/* 3 SHARE boxes — each shows an envelope (the share) handed to a person (validator) */}
      {[
        { x: 100, label: `${t("diag.share")} 1`, val: "validator A" },
        { x: 320, label: `${t("diag.share")} 2`, val: "validator B" },
        { x: 540, label: `${t("diag.share")} N`, val: "validator …" },
      ].map((s) => (
        <g key={s.label}>
          <rect
            x={s.x}
            y="330"
            width="160"
            height="100"
            fill="black"
            stroke={GREEN}
            strokeWidth={STROKE}
          />
          {/* envelope + person glyph pair — visualises "share handed to validator" */}
          <InlineIcon
            name="envelope"
            x={s.x + 10}
            y={342}
            size={20}
            color={GREEN}
          />
          <InlineIcon
            name="person"
            x={s.x + 130}
            y={342}
            size={20}
            color={WHITE}
          />
          <text
            x={s.x + 80}
            y="358"
            fill={GREEN}
            fontFamily="ui-monospace, JetBrains Mono, monospace"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
          >
            [§ {s.label}]
          </text>
          <text
            x={s.x + 80}
            y="382"
            fill={WHITE}
            fontFamily="ui-monospace, JetBrains Mono, monospace"
            fontSize="10"
            textAnchor="middle"
          >
            kind = share
          </text>
          <text
            x={s.x + 80}
            y="400"
            fill={WHITE}
            fontFamily="ui-monospace, JetBrains Mono, monospace"
            fontSize="10"
            textAnchor="middle"
          >
            {t("diag.shamirPiece")}
          </text>
          <text
            x={s.x + 80}
            y="418"
            fill={WHITE}
            fontFamily="ui-monospace, JetBrains Mono, monospace"
            fontSize="10"
            textAnchor="middle"
          >
            {s.val}
          </text>
        </g>
      ))}

      {/* M-of-N convergence bracket */}
      <g>
        <line
          x1="180"
          y1="450"
          x2="620"
          y2="450"
          stroke={GREEN}
          strokeWidth={STROKE}
        />
        <line
          x1="180"
          y1="430"
          x2="180"
          y2="450"
          stroke={GREEN}
          strokeWidth={STROKE}
        />
        <line
          x1="400"
          y1="430"
          x2="400"
          y2="450"
          stroke={GREEN}
          strokeWidth={STROKE}
        />
        <line
          x1="620"
          y1="430"
          x2="620"
          y2="450"
          stroke={GREEN}
          strokeWidth={STROKE}
        />
        <line
          x1="400"
          y1="450"
          x2="400"
          y2="520"
          stroke={GREEN}
          strokeWidth={STROKE}
          markerEnd="url(#arr)"
        />
        <text
          x="400"
          y="475"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          {t("diag.mOfNcooperate")}
        </text>
        <text
          x="400"
          y="492"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
        >
          {t("diag.gate2")}
        </text>
      </g>

      {/* RECOVERED */}
      <g>
        <rect
          x="280"
          y="530"
          width="240"
          height="80"
          fill={GREEN}
          stroke={GREEN}
          strokeWidth={STROKE}
        />
        <InlineIcon name="document" x={295} y={542} size={24} color="black" />
        <text
          x="412"
          y="558"
          fill="black"
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="13"
          fontWeight="bold"
          textAnchor="middle"
        >
          [§ {t("diag.recoveredOriginal")}]
        </text>
        <text
          x="400"
          y="580"
          fill="black"
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
          textAnchor="middle"
        >
          {t("diag.drandRoundPublished")}
        </text>
        <text
          x="400"
          y="596"
          fill="black"
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
          textAnchor="middle"
        >
          {t("diag.shamirReconstructed")}
        </text>
      </g>

      {/* Legend / footer */}
      <g>
        <line
          x1="40"
          y1="650"
          x2="860"
          y2="650"
          stroke={GREEN}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text
          x="40"
          y="680"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          fontWeight="bold"
        >
          [LEGEND]
        </text>
        <text
          x="40"
          y="702"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          → on-chain tx (Arkiv createEntity / extendEntity)
        </text>
        <text
          x="40"
          y="720"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          shared-attribute key links entities (no FKs in Arkiv)
        </text>
        <text
          x="40"
          y="738"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          recovery = drand timelock + Shamir threshold (both must open)
        </text>
      </g>
    </svg>
  );
}
