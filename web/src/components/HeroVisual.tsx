/**
 * HeroVisual — animated SVG composition for the landing hero.
 *
 * Concept: a sealed time-capsule visualized as a square wax-stamp container
 * with the [V] brandmark embedded, plus an orbiting drand-round indicator
 * and a heartbeat pulse ring on the outer edge.
 *
 * Pure SVG + SMIL/CSS animations — no JS animation library, no external
 * assets. Renders crisp at any DPI.
 *
 * Three animated layers:
 *  1. Outer ring     — heartbeat pulse (subtle scale + opacity)
 *  2. Drand counter  — number ticks up every 2 seconds
 *  3. Inner [V] mark — static brand anchor
 */

"use client";

import { useEffect, useState } from "react";

import { useLanguage } from "./LanguageProvider";

const GREEN = "#00e676";

export function HeroVisual({ className = "" }: { className?: string }) {
  const { t } = useLanguage();

  // Drand-round-style counter — pure visual gimmick to suggest "time passing"
  const [round, setRound] = useState(28902472);
  useEffect(() => {
    const id = setInterval(() => setRound((r) => r + 1), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="Veil — sealed time capsule"
    >
      {/* Outer heartbeat pulse ring */}
      <g style={{ transformOrigin: "200px 200px" }}>
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke={GREEN}
          strokeWidth="2"
          opacity="0.4"
        >
          <animate
            attributeName="r"
            values="170;185;170"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.15;0.55;0.15"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="200"
          cy="200"
          r="165"
          fill="none"
          stroke={GREEN}
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.5"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 200 200"
            to="360 200 200"
            dur="40s"
            repeatCount="indefinite"
          />
        </circle>
      </g>

      {/* Top label — orbiting around the seal */}
      <text
        x="200"
        y="50"
        fill={GREEN}
        fontFamily="ui-monospace, JetBrains Mono, monospace"
        fontSize="11"
        fontWeight="bold"
        textAnchor="middle"
      >
        [{t("diag.drandRound")}]
      </text>
      <text
        x="200"
        y="66"
        fill="white"
        fontFamily="ui-monospace, JetBrains Mono, monospace"
        fontSize="13"
        textAnchor="middle"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {round.toLocaleString()}
      </text>

      {/* Bottom label */}
      <text
        x="200"
        y="360"
        fill={GREEN}
        fontFamily="ui-monospace, JetBrains Mono, monospace"
        fontSize="11"
        fontWeight="bold"
        textAnchor="middle"
      >
        [{t("diag.sealedBraga")}]
      </text>
      <text
        x="200"
        y="376"
        fill="white"
        fontFamily="ui-monospace, JetBrains Mono, monospace"
        fontSize="10"
        textAnchor="middle"
        opacity="0.7"
      >
        {t("diag.proofTagline")}
      </text>

      {/* Side labels */}
      <text
        x="30"
        y="205"
        fill={GREEN}
        fontFamily="ui-monospace, JetBrains Mono, monospace"
        fontSize="9"
        fontWeight="bold"
      >
        {t("diag.sealLeft")}
      </text>
      <text
        x="345"
        y="205"
        fill={GREEN}
        fontFamily="ui-monospace, JetBrains Mono, monospace"
        fontSize="9"
        fontWeight="bold"
      >
        {t("diag.openRight")}
      </text>

      {/* Central seal — solid square with [V] mark */}
      <g>
        {/* Shadow */}
        <rect
          x="92"
          y="92"
          width="216"
          height="216"
          rx="12"
          fill="black"
          opacity="0.6"
        />
        {/* Main seal */}
        <rect
          x="88"
          y="88"
          width="216"
          height="216"
          rx="12"
          fill={GREEN}
          stroke="white"
          strokeWidth="2"
        />

        {/* [V] mark — scaled up from icon.svg paths (viewBox was 0 0 64 64, scale ~3.4) */}
        <g transform="translate(88 88) scale(3.375)">
          <path
            d="M 5 14 L 15 14 L 15 19 L 10 19 L 10 45 L 15 45 L 15 50 L 5 50 Z"
            fill="white"
          />
          <path
            d="M 21 14 L 27 14 L 32 37 L 37 14 L 43 14 L 35 50 L 29 50 Z"
            fill="white"
          />
          <path
            d="M 59 14 L 49 14 L 49 19 L 54 19 L 54 45 L 49 45 L 49 50 L 59 50 Z"
            fill="white"
          />
        </g>
      </g>

      {/* Corner brackets — Arkiv-style framing */}
      {[
        { x: 36, y: 36, rot: 0 },
        { x: 364, y: 36, rot: 90 },
        { x: 364, y: 364, rot: 180 },
        { x: 36, y: 364, rot: 270 },
      ].map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.rot})`}>
          <path
            d="M -16 0 L 0 0 L 0 16"
            fill="none"
            stroke={GREEN}
            strokeWidth="3"
          />
        </g>
      ))}
    </svg>
  );
}
