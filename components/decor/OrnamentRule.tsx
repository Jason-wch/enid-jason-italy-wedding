/** Centered divider: hairline — leaf diamond — hairline. */
export default function OrnamentRule({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
      <span className="hairline w-16 sm:w-24" />
      <svg width="34" height="16" viewBox="0 0 34 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="7" cy="8" rx="6" ry="2.4" transform="rotate(-24 7 8)" fill="var(--color-oliva)" />
        <path d="M14 8 L 17 4.5 L 20 8 L 17 11.5 Z" fill="var(--color-gold)" />
        <ellipse cx="27" cy="8" rx="6" ry="2.4" transform="rotate(24 27 8)" fill="var(--color-oliva)" />
      </svg>
      <span className="hairline w-16 sm:w-24" />
    </div>
  );
}
