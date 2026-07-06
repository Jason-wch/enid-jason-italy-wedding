/** Two lemons with leaves — the Lake Garda limonaia signature. */
export default function LemonSprig({
  width = 110,
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
      height={width * 0.9}
      viewBox="0 0 120 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      {/* Stem */}
      <path d="M60 6 C 55 30, 48 48, 40 66 M60 6 C 68 28, 76 44, 84 58" stroke="var(--color-verde)" strokeWidth="2" fill="none" />
      {/* Leaves */}
      <ellipse cx="46" cy="30" rx="16" ry="6.5" transform="rotate(-52 46 30)" fill="var(--color-verde)" />
      <ellipse cx="76" cy="26" rx="15" ry="6" transform="rotate(48 76 26)" fill="var(--color-sage-dark)" />
      <ellipse cx="62" cy="46" rx="13" ry="5.5" transform="rotate(-70 62 46)" fill="var(--color-sage)" />
      {/* Lemons: body + nipple ends, gold rind stroke */}
      <g>
        <ellipse cx="38" cy="82" rx="17" ry="13.5" transform="rotate(-18 38 82)" fill="var(--color-limone)" stroke="var(--color-gold)" strokeWidth="1.2" />
        <ellipse cx="24.5" cy="76.5" rx="3.2" ry="2.4" transform="rotate(-18 24.5 76.5)" fill="var(--color-limone)" stroke="var(--color-gold)" strokeWidth="1" />
        <path d="M32 76 C 36 73.5, 42 73.5, 46 76" stroke="color-mix(in srgb, var(--color-gold) 55%, transparent)" strokeWidth="1" fill="none" />
      </g>
      <g>
        <ellipse cx="86" cy="80" rx="15.5" ry="12.5" transform="rotate(22 86 80)" fill="var(--color-limone)" stroke="var(--color-gold)" strokeWidth="1.2" />
        <ellipse cx="99" cy="86" rx="3" ry="2.2" transform="rotate(22 99 86)" fill="var(--color-limone)" stroke="var(--color-gold)" strokeWidth="1" />
        <path d="M79 74.5 C 83 72.5, 89 72.8, 92.5 75.5" stroke="color-mix(in srgb, var(--color-gold) 55%, transparent)" strokeWidth="1" fill="none" />
      </g>
    </svg>
  );
}
