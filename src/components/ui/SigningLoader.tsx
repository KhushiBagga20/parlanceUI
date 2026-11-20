/**
 * The Parlance loading indicator: a friendly hand that waves while something
 * is being prepared, with three dots and the status in words.
 *
 * The movement is an abstract hello wave, not an ISL sign, and it must never
 * be labelled as one. Under reduced motion the hand and dots hold still and
 * only the words change.
 */
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";

interface SigningLoaderProps {
  /** What is happening, in words, e.g. "Preparing signs". */
  label: string;
  size?: "sm" | "md" | "lg";
  layout?: "stack" | "inline";
  /**
   * Announce the label as a polite live status. Turn off when a surrounding
   * element already reports the same status, so it isn't read twice.
   */
  live?: boolean;
  /** Keep the words for screen readers only. */
  hideLabel?: boolean;
  /** For dark surfaces. */
  inverse?: boolean;
  /**
   * Draw only the moving hand, with no words, for use as an icon inside an
   * element that already states the status in text.
   */
  decorative?: boolean;
  className?: string;
}

/* Fingers, palm and thumb. Drawn twice: once stroked (the outline), then
   filled on top, so the outline wraps the whole hand without inner seams. */
const HAND = (
  <>
    <rect x="19" y="13" width="6.6" height="25" rx="3.3" />
    <rect x="26.2" y="8.5" width="6.6" height="29" rx="3.3" />
    <rect x="33.4" y="11" width="6.6" height="27" rx="3.3" />
    <rect x="40.6" y="17" width="6" height="22" rx="3" />
    <rect x="19" y="26" width="27.6" height="25" rx="11" />
    <rect x="12.5" y="28" width="7.5" height="18" rx="3.75" transform="rotate(-32 17 44)" />
  </>
);

const SIZES = {
  sm: { svg: "size-6", dot: "size-1", text: "text-[0.8125rem]" },
  md: { svg: "size-12", dot: "size-1.5", text: "text-sm" },
  lg: { svg: "size-20", dot: "size-2", text: "text-base" },
};

export function SigningLoader({
  label,
  size = "md",
  layout = "stack",
  live = true,
  hideLabel = false,
  inverse = false,
  decorative = false,
  className,
}: SigningLoaderProps) {
  const reduced = useReducedMotion();
  const s = SIZES[size];
  const outline = inverse ? "#FFFFFF" : "#011638";

  const hand = (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("shrink-0 overflow-visible", decorative && className ? className : s.svg)}>
      {/* motion marks either side of the fingertips */}
      <g
        fill="none"
        stroke={inverse ? "#EEC643" : "#0D21A1"}
        strokeWidth="2.4"
        strokeLinecap="round"
        className={reduced ? "opacity-0" : "animate-hand-trail"}
      >
        <path d="M52 9.5c3.5 3 5 7 4.5 11.5" />
        <path d="M12 9.5C8.5 12.5 7 16.5 7.5 21" />
      </g>
      <g className={reduced ? undefined : "animate-hand-wave"} style={{ transformBox: "view-box", transformOrigin: "32px 58px" }}>
        <g fill={outline} stroke={outline} strokeWidth="3.6" strokeLinejoin="round">
          {HAND}
        </g>
        <g fill="#FFD56B">{HAND}</g>
        <path d="M24 44.5q8.5 4 17 0" fill="none" stroke="#011638" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" />
        <rect x="21.5" y="49.5" width="22.5" height="12.5" rx="4.5" fill={inverse ? "#FFFFFF" : "#0D21A1"} />
      </g>
    </svg>
  );

  if (decorative) return hand;

  return (
    <div
      role={live ? "status" : undefined}
      className={cn(
        "inline-flex items-center",
        layout === "stack" ? "flex-col gap-2 text-center" : "flex-row gap-2.5",
        className,
      )}
      data-reduced-motion={reduced ? "" : undefined}
    >
      {hand}

      <span className={cn("inline-flex items-center gap-2 font-semibold", s.text, inverse ? "text-white" : "text-navy", hideLabel && "sr-only")}>
        {label}
        <span aria-hidden className="inline-flex items-center gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className={cn(s.dot, "rounded-full", inverse ? "bg-gold" : "bg-royal", reduced ? "opacity-60" : "animate-dot-bounce")}
              style={reduced ? undefined : { animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      </span>
    </div>
  );
}
