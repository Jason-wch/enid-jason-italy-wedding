/**
 * Wide line-art illustration of Villa Sostaga above Lake Garda:
 * villa with tower on a terraced hill, cypresses, mountains, lake, boat, sun.
 * Drawn entirely in currentColor — set text color on the parent
 * (e.g. text-cream on verde-deep, or text-verde on cream).
 */
export default function LakeScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.5" fill="none">
        {/* Sun with fine rays */}
        <circle cx="655" cy="60" r="24" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const x1 = 655 + Math.cos(a) * 32;
          const y1 = 60 + Math.sin(a) * 32;
          const x2 = 655 + Math.cos(a) * 40;
          const y2 = 60 + Math.sin(a) * 40;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1" opacity="0.8" />;
        })}

        {/* Distant mountains */}
        <path d="M420 178 L 510 96 L 585 160 L 650 118 L 730 178" opacity="0.7" />
        <path d="M470 178 L 545 128 L 610 172" opacity="0.45" strokeWidth="1" />

        {/* Hill under the villa */}
        <path d="M30 300 C 60 240, 90 210, 150 196 L 330 196 C 380 214, 410 250, 430 300" />

        {/* Terraces on the hill */}
        <path d="M95 246 L 205 246 M78 272 L 240 272" strokeWidth="1" opacity="0.7" />

        {/* Villa body */}
        <rect x="150" y="130" width="130" height="66" />
        {/* Roof */}
        <path d="M143 130 L 215 106 L 287 130" />
        {/* Tower */}
        <rect x="230" y="82" width="34" height="48" />
        <path d="M225 82 L 247 66 L 269 82" />
        <path d="M239 92 a 8 8 0 0 1 16 0 v 12 h -16 Z" strokeWidth="1" />
        {/* Arched windows */}
        {[166, 192, 218].map((x) => (
          <path key={x} d={`M${x} 158 a 7 7 0 0 1 14 0 v 20 h -14 Z`} strokeWidth="1" />
        ))}
        {/* Door */}
        <path d="M244 196 v -22 a 9 9 0 0 1 18 0 v 22" strokeWidth="1" />

        {/* Cypresses flanking the villa */}
        {[
          { x: 120, h: 58 },
          { x: 135, h: 42 },
          { x: 300, h: 62 },
          { x: 318, h: 46 },
        ].map((t, i) => (
          <g key={i}>
            <path
              d={`M${t.x} ${196 - t.h} C ${t.x - 8} ${196 - t.h * 0.5}, ${t.x - 8} ${196 - t.h * 0.15}, ${t.x} 194 C ${t.x + 8} ${196 - t.h * 0.15}, ${t.x + 8} ${196 - t.h * 0.5}, ${t.x} ${196 - t.h} Z`}
              strokeWidth="1.2"
            />
          </g>
        ))}

        {/* Lake waves */}
        <path d="M430 232 q 20 -8 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0" strokeWidth="1" opacity="0.8" />
        <path d="M460 256 q 20 -8 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0" strokeWidth="1" opacity="0.6" />
        <path d="M440 280 q 20 -8 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0" strokeWidth="1" opacity="0.4" />

        {/* Little boat */}
        <path d="M560 224 h 44 l -8 12 h -28 Z" strokeWidth="1.2" />
        <line x1="582" y1="224" x2="582" y2="196" strokeWidth="1" />
        <path d="M582 198 C 592 202, 598 210, 600 220 L 582 220 Z" strokeWidth="1" />

        {/* Birds */}
        <path d="M500 70 q 5 -6 10 0 q 5 -6 10 0" strokeWidth="1" opacity="0.7" />
        <path d="M540 88 q 4 -5 8 0 q 4 -5 8 0" strokeWidth="1" opacity="0.55" />
      </g>
    </svg>
  );
}
