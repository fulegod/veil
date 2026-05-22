/**
 * Dynamic Open Graph image — rendered at request time via Next's
 * ImageResponse. 1200×630 (standard OG size). MonoGrid Newspaper style:
 * black + white + neon green accent, JetBrains Mono, bracketed labels.
 *
 * Lives at /opengraph-image automatically — referenced from <head>
 * by Next.js metadata.openGraph.
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Veil — trustless time capsules on Arkiv";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#ffffff",
        color: "#000000",
        display: "flex",
        flexDirection: "column",
        padding: 64,
        fontFamily: "monospace",
      }}
    >
      {/* Top bar — masthead */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 16,
          borderBottom: "4px solid #000",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            VEIL
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 4,
              color: "#666",
            }}
          >
            SEAL IT. PROVE IT.
          </span>
        </div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 4,
            color: "#666",
          }}
        >
          [PRIVACY · ARKIV × ETHNS]
        </span>
      </div>

      {/* Headline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 56,
          gap: 18,
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 6,
            color: "#666",
          }}
        >
          [§00 — MASTHEAD]
        </span>
        <span
          style={{
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: -4,
            lineHeight: 0.95,
          }}
        >
          STOP EDITING
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: -4,
            lineHeight: 0.95,
          }}
        >
          <span
            style={{
              background: "#00e676",
              padding: "0 18px",
              color: "#000",
            }}
          >
            YOUR TRACK RECORD.
          </span>
        </span>
      </div>

      {/* Bottom bar — meta + arrow */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: "auto",
          paddingTop: 24,
          borderTop: "2px solid #000",
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#222",
            maxWidth: 720,
            lineHeight: 1.2,
          }}
        >
          Trustless time capsules. Encrypt today. Reveal cryptographically.
        </span>
        <span
          style={{
            display: "flex",
            gap: 16,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 4,
            color: "#000",
          }}
        >
          <span
            style={{
              background: "#000",
              color: "#00e676",
              padding: "6px 12px",
            }}
          >
            [VEIL.APP]
          </span>
        </span>
      </div>
    </div>,
    { ...size },
  );
}
