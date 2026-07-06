/** Decorative arch outline with thin mullions — frames countdowns/numbers. */
export default function ArchWindow({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 160 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M10 190 V 80 A 70 70 0 0 1 150 80 V 190"
          stroke="color-mix(in srgb, var(--color-gold) 55%, transparent)"
          strokeWidth="1.5"
        />
        <path
          d="M20 190 V 82 A 60 60 0 0 1 140 82 V 190"
          stroke="color-mix(in srgb, var(--color-gold) 30%, transparent)"
          strokeWidth="1"
        />
        <line x1="4" y1="190" x2="156" y2="190" stroke="color-mix(in srgb, var(--color-gold) 55%, transparent)" strokeWidth="1.5" />
      </svg>
      <div className="relative px-10 py-12 text-center">{children}</div>
    </div>
  );
}
