import { LogoMark } from "./Logo";

/**
 * Neutral placeholder for a photo slot: soft parchment field, hairline
 * border, ghosted cypress mark and a small caps label. Size it with an
 * aspect-* class on `className`.
 */
export default function PhotoPlaceholder({
  label = "Photo to come",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-4 bg-parchment border border-ink/10 overflow-hidden ${className}`}
    >
      <LogoMark size={44} className="text-ink/15" />
      <span
        className="font-sans text-[0.6rem] font-medium tracking-[0.3em] uppercase text-ink/35 px-4 text-center"
        style={{ textIndent: "0.3em" }}
      >
        {label}
      </span>
    </div>
  );
}
