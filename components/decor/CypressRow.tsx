/** A quiet row of cypress trees for section footers. */
export default function CypressRow({
  width = 180,
  className = "",
}: {
  width?: number;
  className?: string;
}) {
  const trees = [
    { x: 20, h: 52, w: 9 },
    { x: 55, h: 70, w: 11 },
    { x: 92, h: 60, w: 10 },
    { x: 128, h: 74, w: 11 },
    { x: 162, h: 55, w: 9 },
  ];
  return (
    <svg
      width={width}
      height={width * 0.5}
      viewBox="0 0 184 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {trees.map((t, i) => (
        <g key={i}>
          {/* Flame-shaped canopy */}
          <path
            d={`M${t.x} ${86 - t.h}
               C ${t.x - t.w} ${86 - t.h * 0.55}, ${t.x - t.w} ${86 - t.h * 0.2}, ${t.x} 84
               C ${t.x + t.w} ${86 - t.h * 0.2}, ${t.x + t.w} ${86 - t.h * 0.55}, ${t.x} ${86 - t.h} Z`}
            fill={i % 2 ? "var(--color-verde)" : "var(--color-verde-deep)"}
          />
          <line x1={t.x} y1="84" x2={t.x} y2="90" stroke="var(--color-verde-deep)" strokeWidth="1.5" />
        </g>
      ))}
      {/* Ground line */}
      <line x1="4" y1="90" x2="180" y2="90" stroke="color-mix(in srgb, var(--color-ink) 25%, transparent)" strokeWidth="1" />
    </svg>
  );
}
