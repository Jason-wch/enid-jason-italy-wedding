/** E & J monogram in a thin oval ring with olive leaves at the base. */
export default function Monogram({
  size = 44,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Enid & Jason monogram"
      role="img"
    >
      {/* Oval ring */}
      <ellipse cx="40" cy="48" rx="34" ry="44" stroke="currentColor" strokeWidth="1.2" opacity="0.85" />
      <ellipse cx="40" cy="48" rx="30" ry="40" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
      {/* E */}
      <text
        x="22"
        y="56"
        textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="30"
        fontWeight="400"
        fill="currentColor"
      >
        E
      </text>
      {/* & */}
      <text
        x="40"
        y="62"
        textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif"
        fontStyle="italic"
        fontSize="20"
        fontWeight="380"
        fill="currentColor"
        opacity="0.8"
      >
        &amp;
      </text>
      {/* J */}
      <text
        x="58"
        y="56"
        textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="30"
        fontWeight="400"
        fill="currentColor"
      >
        J
      </text>
      {/* Olive leaves at the base of the ring */}
      <g stroke="currentColor" strokeWidth="1" opacity="0.75">
        <path d="M40 92 C 34 89, 28 89, 24 91" fill="none" />
        <path d="M40 92 C 46 89, 52 89, 56 91" fill="none" />
        <ellipse cx="28" cy="89.6" rx="3.2" ry="1.4" transform="rotate(-14 28 89.6)" fill="currentColor" stroke="none" />
        <ellipse cx="34" cy="90.6" rx="3.2" ry="1.4" transform="rotate(-8 34 90.6)" fill="currentColor" stroke="none" />
        <ellipse cx="52" cy="89.6" rx="3.2" ry="1.4" transform="rotate(14 52 89.6)" fill="currentColor" stroke="none" />
        <ellipse cx="46" cy="90.6" rx="3.2" ry="1.4" transform="rotate(8 46 90.6)" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
