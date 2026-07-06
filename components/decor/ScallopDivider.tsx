/**
 * Full-width scallop strip. `color` is the CSS color of the section the
 * scallops belong to (they bite into whatever sits below/above).
 */
export default function ScallopDivider({
  color = "var(--color-cream)",
  flip = false,
  className = "",
}: {
  color?: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        height: 13,
        transform: flip ? "scaleY(-1)" : undefined,
        backgroundImage: `radial-gradient(circle at 50% 0, ${color} 62%, transparent 66%)`,
        backgroundSize: "26px 13px",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}
