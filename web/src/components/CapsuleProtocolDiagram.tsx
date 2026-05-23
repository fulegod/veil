/**
 * CapsuleProtocolDiagram — SVG circuit diagram of the Capsule protocol.
 * Mirrors InheritanceProtocolDiagram structurally so both diagrams read
 * the same way visually.
 *
 * Boxes  : Writer (owner), Capsule entity, Plaintext (derived), Reveal entity
 * Arrows : createEntity, drand-round-publishes, publishReveal
 * Notes  : two attributes are queryable (unlock_round, unlock_at) — labeled
 *          on the Capsule box. The Reveal links back via capsule_key.
 */

const GREEN = "#00e676";
const WHITE = "#ffffff";
const STROKE = 2;

export function CapsuleProtocolDiagram({
  className = "",
}: {
  className?: string;
}) {
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
        <text
          x="120"
          y="88"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          [§ WRITER]
        </text>
        <text
          x="120"
          y="106"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="11"
          textAnchor="middle"
        >
          $creator (immutable)
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
        <text
          x="460"
          y="68"
          fill={GREEN}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          [§ CAPSULE]
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
          GATE — drand timelock
        </text>
      </g>

      {/* Drand publishes round → arrow down */}
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
          drand round N publishes
        </text>
        <text
          x="475"
          y="266"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          → key becomes derivable
        </text>
      </g>

      {/* PLAINTEXT box (just a passthrough concept, not an entity) */}
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
          PLAINTEXT (derivable by anyone)
        </text>
        <text
          x="460"
          y="346"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
          textAnchor="middle"
        >
          no entity — happens in any reader's browser
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
          first decrypter publishes
        </text>
        <text
          x="475"
          y="412"
          fill={WHITE}
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="10"
        >
          a Reveal (only hash, not text)
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
        <text
          x="460"
          y="458"
          fill="black"
          fontFamily="ui-monospace, JetBrains Mono, monospace"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          [§ REVEAL]
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

      {/* Side note: timeline */}
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
          TIMELINE
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
          seal it
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
          wait
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
          verify
        </text>
      </g>
    </svg>
  );
}
