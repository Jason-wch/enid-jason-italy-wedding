/**
 * Line-art logo lockup in the style of the reference: a fine-lined cypress
 * mark above a letterspaced serif wordmark and a tiny location line.
 */
export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size * 0.9}
      viewBox="0 0 60 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.1" fill="none">
        {/* three slender cypresses */}
        <path d="M18 50 C 14 42, 14 30, 18 14 C 22 30, 22 42, 18 50 Z" />
        <path d="M30 52 C 25.5 42, 25.5 26, 30 4 C 34.5 26, 34.5 42, 30 52 Z" />
        <path d="M42 50 C 38 42, 38 30, 42 14 C 46 30, 46 42, 42 50 Z" />
        {/* inner vein lines */}
        <path d="M18 46 V 20 M30 48 V 10 M42 46 V 20" strokeWidth="0.55" opacity="0.7" />
        {/* ground */}
        <path d="M8 52.5 H 52" strokeWidth="0.8" opacity="0.8" />
      </g>
    </svg>
  );
}

export default function Logo({
  markSize = 34,
  compact = false,
  className = "",
}: {
  markSize?: number;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex flex-col items-center ${className}`}>
      <LogoMark size={markSize} className="text-gold" />
      <span
        className="font-heading mt-1.5 text-[0.98rem] leading-none tracking-[0.32em] uppercase text-ink"
        style={{ textIndent: "0.32em" }}
      >
        Enid &amp; Jason
      </span>
      {!compact && (
        <span
          className="font-sans mt-1.5 text-[0.5rem] font-medium leading-none tracking-[0.42em] uppercase text-stone"
          style={{ textIndent: "0.42em" }}
        >
          Lake Garda
        </span>
      )}
    </span>
  );
}
