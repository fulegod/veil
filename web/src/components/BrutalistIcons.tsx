/**
 * BrutalistIcons — hand-drawn SVG glyphs for Veil.
 *
 * All icons share:
 *  - viewBox 24×24
 *  - 2px geometric strokes
 *  - currentColor stroke (so they inherit text-* color)
 *  - No fills by default (transparent — pure linework)
 *  - No serifs, no flourishes — match the brutalist newspaper voice
 *
 * Use these in JSX wherever you'd otherwise write "user 1" or "wallet 2"
 * — gives a visual anchor to the abstract entities.
 *
 * For inline use INSIDE the circuit-diagram SVGs (where you can't render
 * a React component as a child of <svg>), each icon's path data is
 * exported as a string constant and the diagrams paint the paths directly.
 */

type Props = { className?: string; size?: number; title?: string };

const SW = 2; // stroke width

function box(size: number) {
  return { width: size, height: size, viewBox: "0 0 24 24" } as const;
}

// ─── Person — anonymous silhouette (head + shoulders) ──────────────────
export function PersonGlyph({ className = "", size = 20, title }: Props) {
  return (
    <svg
      {...box(size)}
      className={className}
      stroke="currentColor"
      strokeWidth={SW}
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M 3 22 Q 3 13 12 13 Q 21 13 21 22" strokeLinecap="square" />
    </svg>
  );
}

// ─── Vault — boxed safe with central dial ──────────────────────────────
export function VaultGlyph({ className = "", size = 20, title }: Props) {
  return (
    <svg
      {...box(size)}
      className={className}
      stroke="currentColor"
      strokeWidth={SW}
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <rect x="3" y="4" width="18" height="16" />
      <circle cx="12" cy="12" r="3.5" />
      <line x1="12" y1="12" x2="14.5" y2="9.5" />
      <line x1="3" y1="8" x2="6" y2="8" />
      <line x1="3" y1="16" x2="6" y2="16" />
    </svg>
  );
}

// ─── Lock — closed padlock ─────────────────────────────────────────────
export function LockGlyph({ className = "", size = 20, title }: Props) {
  return (
    <svg
      {...box(size)}
      className={className}
      stroke="currentColor"
      strokeWidth={SW}
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <rect x="5" y="11" width="14" height="10" />
      <path d="M 8 11 V 7 Q 8 3 12 3 Q 16 3 16 7 V 11" />
    </svg>
  );
}

// ─── Key — head + shaft + teeth ────────────────────────────────────────
export function KeyGlyph({ className = "", size = 20, title }: Props) {
  return (
    <svg
      {...box(size)}
      className={className}
      stroke="currentColor"
      strokeWidth={SW}
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <circle cx="6" cy="12" r="3" />
      <line x1="9" y1="12" x2="21" y2="12" />
      <line x1="17" y1="12" x2="17" y2="16" />
      <line x1="19" y1="12" x2="19" y2="15" />
    </svg>
  );
}

// ─── Document — folded paper with fold corner ──────────────────────────
export function DocumentGlyph({ className = "", size = 20, title }: Props) {
  return (
    <svg
      {...box(size)}
      className={className}
      stroke="currentColor"
      strokeWidth={SW}
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <path d="M 6 3 H 15 L 20 8 V 21 H 6 Z" strokeLinejoin="miter" />
      <path d="M 15 3 V 8 H 20" />
      <line x1="9" y1="13" x2="17" y2="13" />
      <line x1="9" y1="16" x2="17" y2="16" />
    </svg>
  );
}

// ─── Envelope — sealed letter with wax dot ─────────────────────────────
export function EnvelopeGlyph({ className = "", size = 20, title }: Props) {
  return (
    <svg
      {...box(size)}
      className={className}
      stroke="currentColor"
      strokeWidth={SW}
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <rect x="3" y="6" width="18" height="14" />
      <path d="M 3 6 L 12 13 L 21 6" strokeLinejoin="miter" />
      <circle cx="18" cy="17" r="1.5" fill="currentColor" />
    </svg>
  );
}

// ─── Hourglass — heartbeat timer ───────────────────────────────────────
export function HourglassGlyph({ className = "", size = 20, title }: Props) {
  return (
    <svg
      {...box(size)}
      className={className}
      stroke="currentColor"
      strokeWidth={SW}
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <line x1="5" y1="3" x2="19" y2="3" />
      <line x1="5" y1="21" x2="19" y2="21" />
      <path
        d="M 5 3 L 19 3 L 12 12 L 19 21 L 5 21 L 12 12 Z"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

// ─── Inline-SVG path data (for use INSIDE <svg> circuit diagrams) ───────
//
// Each entry is { paths, viewBox: [w, h], strokeColor }.
// To paint at position (x, y) with width W inside a parent SVG, wrap in:
//   <g transform={`translate(${x} ${y}) scale(${W / viewBoxW})`}>
//     {paths}
//   </g>

export const ICON_PATHS = {
  person: (
    <>
      <circle
        cx="12"
        cy="7"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path
        d="M 3 22 Q 3 13 12 13 Q 21 13 21 22"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="square"
      />
    </>
  ),
  vault: (
    <>
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <circle
        cx="12"
        cy="12"
        r="3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <line
        x1="12"
        y1="12"
        x2="14.5"
        y2="9.5"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <line
        x1="3"
        y1="8"
        x2="6"
        y2="8"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <line
        x1="3"
        y1="16"
        x2="6"
        y2="16"
        stroke="currentColor"
        strokeWidth={SW}
      />
    </>
  ),
  envelope: (
    <>
      <rect
        x="3"
        y="6"
        width="18"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path
        d="M 3 6 L 12 13 L 21 6"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <circle cx="18" cy="17" r="1.5" fill="currentColor" />
    </>
  ),
  document: (
    <>
      <path
        d="M 6 3 H 15 L 20 8 V 21 H 6 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path
        d="M 15 3 V 8 H 20"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <line
        x1="9"
        y1="13"
        x2="17"
        y2="13"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <line
        x1="9"
        y1="16"
        x2="17"
        y2="16"
        stroke="currentColor"
        strokeWidth={SW}
      />
    </>
  ),
  key: (
    <>
      <circle
        cx="6"
        cy="12"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <line
        x1="9"
        y1="12"
        x2="21"
        y2="12"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <line
        x1="17"
        y1="12"
        x2="17"
        y2="16"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <line
        x1="19"
        y1="12"
        x2="19"
        y2="15"
        stroke="currentColor"
        strokeWidth={SW}
      />
    </>
  ),
  hourglass: (
    <>
      <line
        x1="5"
        y1="3"
        x2="19"
        y2="3"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <line
        x1="5"
        y1="21"
        x2="19"
        y2="21"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path
        d="M 5 3 L 19 3 L 12 12 L 19 21 L 5 21 L 12 12 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
      />
    </>
  ),
  lock: (
    <>
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path
        d="M 8 11 V 7 Q 8 3 12 3 Q 16 3 16 7 V 11"
        fill="none"
        stroke="currentColor"
        strokeWidth={SW}
      />
    </>
  ),
} as const;

export type IconName = keyof typeof ICON_PATHS;

/**
 * InlineIcon — for use INSIDE a parent <svg> (e.g. a circuit diagram).
 * Positions the icon at (x, y) and scales it to fit `size` px.
 */
export function InlineIcon({
  name,
  x,
  y,
  size = 24,
  color = "currentColor",
}: {
  name: IconName;
  x: number;
  y: number;
  size?: number;
  color?: string;
}) {
  const scale = size / 24;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} style={{ color }}>
      {ICON_PATHS[name]}
    </g>
  );
}
