/**
 * InheritanceProtocolDiagram — SVG circuit-style diagram of the Inheritance
 * protocol. Replaces the fragile ASCII-art version that broke in HTML
 * monospace rendering. Pure SVG, no external libs, scales to any width.
 *
 * Boxes  : Vault, Shares (3 + ellipsis for N), Owner, Recovered
 * Arrows : createEntity, vault_key (×3), extendEntity (heartbeat loop),
 *          M-of-N convergence, recovery output
 *
 * Two cryptographic gates visually emphasized:
 *   Gate 1 — drand timelock (text annotation near Vault payload)
 *   Gate 2 — Shamir M-of-N (text annotation near the convergence bracket)
 */

const GREEN = "#00e676";
const WHITE = "#ffffff";
const STROKE = 2;

export function InheritanceProtocolDiagram({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 800 720"
      className={className}
      role="img"
      aria-labelledby="protocol-diagram-title"
    >
      <title id="protocol-diagram-title">
        Inheritance protocol — entities and lifecycle
      </title>

      {/* Arrowhead marker */}
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

      {/* ─── OWNER ──────────────────────────────────────── */}
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
        <text
          x="120"
          y="68"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          [§ OWNER]
        </text>
        <text
          x="120"
          y="86"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
          textAnchor="middle"
        >
          $creator + $owner
        </text>
      </g>

      {/* Arrow: OWNER → VAULT (createEntity) */}
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

      {/* ─── VAULT ──────────────────────────────────────── */}
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
        <text
          x="460"
          y="68"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          [§ VAULT]
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
        {/* Gate 1 label */}
        <text
          x="460"
          y="200"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
        >
          GATE 1 — drand timelock
        </text>
      </g>

      {/* extendEntity self-loop on VAULT */}
      <g>
        <path
          d="M 600 80 Q 720 80 720 130 Q 720 180 600 180"
          fill="none"
          stroke={GREEN}
          strokeWidth={STROKE}
          markerEnd="url(#arr)"
        />
        <text
          x="730"
          y="100"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          textAnchor="middle"
        >
          extend
        </text>
        <text
          x="730"
          y="115"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          textAnchor="middle"
        >
          Entity
        </text>
        <text
          x="730"
          y="145"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
        >
          PROOF
        </text>
        <text
          x="730"
          y="158"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
        >
          OF LIFE
        </text>
        <text
          x="730"
          y="175"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="9"
          textAnchor="middle"
        >
          ($owner only)
        </text>
      </g>

      {/* Arrows: VAULT → 3 SHARES (vault_key) */}
      <g>
        <line
          x1="380"
          y1="220"
          x2="180"
          y2="310"
          stroke={GREEN}
          strokeWidth={STROKE}
          markerEnd="url(#arr)"
        />
        <line
          x1="460"
          y1="220"
          x2="400"
          y2="310"
          stroke={GREEN}
          strokeWidth={STROKE}
          markerEnd="url(#arr)"
        />
        <line
          x1="540"
          y1="220"
          x2="620"
          y2="310"
          stroke={GREEN}
          strokeWidth={STROKE}
          markerEnd="url(#arr)"
        />
        <text
          x="460"
          y="270"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          textAnchor="middle"
        >
          shared-attribute key: vault_key
        </text>
      </g>

      {/* ─── 3 SHARE boxes ──────────────────────────────── */}
      {[
        { x: 100, label: "SHARE 1", val: "validator A" },
        { x: 320, label: "SHARE 2", val: "validator B" },
        { x: 540, label: "SHARE N", val: "validator …" },
      ].map((s) => (
        <g key={s.label}>
          <rect
            x={s.x}
            y="310"
            width="160"
            height="100"
            fill="black"
            stroke={GREEN}
            strokeWidth={STROKE}
          />
          <text
            x={s.x + 80}
            y="338"
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
            y="362"
            fill={WHITE}
            fontFamily="ui-monospace, JetBrains Mono, monospace"
            fontSize="10"
            textAnchor="middle"
          >
            kind = share
          </text>
          <text
            x={s.x + 80}
            y="380"
            fill={WHITE}
            fontFamily="ui-monospace, JetBrains Mono, monospace"
            fontSize="10"
            textAnchor="middle"
          >
            Shamir piece
          </text>
          <text
            x={s.x + 80}
            y="398"
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
          y1="430"
          x2="620"
          y2="430"
          stroke={GREEN}
          strokeWidth={STROKE}
        />
        <line
          x1="180"
          y1="410"
          x2="180"
          y2="430"
          stroke={GREEN}
          strokeWidth={STROKE}
        />
        <line
          x1="400"
          y1="410"
          x2="400"
          y2="430"
          stroke={GREEN}
          strokeWidth={STROKE}
        />
        <line
          x1="620"
          y1="410"
          x2="620"
          y2="430"
          stroke={GREEN}
          strokeWidth={STROKE}
        />
        <line
          x1="400"
          y1="430"
          x2="400"
          y2="490"
          stroke={GREEN}
          strokeWidth={STROKE}
          markerEnd="url(#arr)"
        />
        <text
          x="400"
          y="450"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          M of N validators cooperate
        </text>
        <text
          x="400"
          y="468"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
        >
          GATE 2 — Shamir threshold
        </text>
      </g>

      {/* ─── RECOVERED ──────────────────────────────────── */}
      <g>
        <rect
          x="280"
          y="500"
          width="240"
          height="80"
          fill={GREEN}
          stroke={GREEN}
          strokeWidth={STROKE}
        />
        <text
          x="400"
          y="528"
          fill="black"
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          [§ RECOVERED ORIGINAL]
        </text>
        <text
          x="400"
          y="550"
          fill="black"
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
          textAnchor="middle"
        >
          drand round published
        </text>
        <text
          x="400"
          y="566"
          fill="black"
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
          textAnchor="middle"
        >
          + Shamir reconstructed
        </text>
      </g>

      {/* Legend / annotation footer */}
      <g>
        <line
          x1="40"
          y1="620"
          x2="760"
          y2="620"
          stroke={GREEN}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text
          x="40"
          y="650"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          fontWeight="bold"
        >
          [LEGEND]
        </text>
        <text
          x="40"
          y="672"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          → on-chain tx (Arkiv createEntity / extendEntity)
        </text>
        <text
          x="40"
          y="690"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          shared-attribute key links entities (no FKs in Arkiv)
        </text>
        <text
          x="40"
          y="708"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          recovery requires BOTH gates open: drand timelock + Shamir threshold
        </text>
      </g>
    </svg>
  );
}
