/** Curved olive branch with paired leaves and a few olives. */
export default function OliveBranch({
  width = 140,
  mirror = false,
  className = "",
}: {
  width?: number;
  mirror?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={width * 0.5}
      viewBox="0 0 200 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      {/* Stem */}
      <path
        d="M8 88 C 50 78, 110 60, 190 14"
        stroke="var(--color-oliva)"
        strokeWidth="2"
        fill="none"
      />
      {/* Leaf pairs along the stem */}
      {[
        { x: 36, y: 79, a: -38 },
        { x: 62, y: 71, a: -34 },
        { x: 90, y: 61, a: -30 },
        { x: 118, y: 50, a: -28 },
        { x: 146, y: 38, a: -26 },
        { x: 170, y: 26, a: -24 },
      ].map((l, i) => (
        <g key={i}>
          <ellipse
            cx={l.x}
            cy={l.y - 8}
            rx="13"
            ry="4.2"
            transform={`rotate(${l.a - 26} ${l.x} ${l.y - 8})`}
            fill={i % 2 ? "var(--color-sage)" : "var(--color-oliva)"}
          />
          <ellipse
            cx={l.x + 4}
            cy={l.y + 7}
            rx="13"
            ry="4.2"
            transform={`rotate(${l.a + 34} ${l.x + 4} ${l.y + 7})`}
            fill={i % 2 ? "var(--color-oliva)" : "var(--color-sage)"}
          />
        </g>
      ))}
      {/* Olives */}
      <circle cx="76" cy="70" r="5" fill="var(--color-verde-deep)" />
      <circle cx="108" cy="58" r="5" fill="var(--color-verde)" />
      <circle cx="138" cy="45" r="4.5" fill="var(--color-verde-deep)" />
    </svg>
  );
}
