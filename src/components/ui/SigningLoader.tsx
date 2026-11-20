/**
 * The Parlance loading indicator: a flat hand waving in front of a small
 * rainbow, with three dots and the status in words.
 *
 * The movement is an abstract hello wave, not an ISL sign, and it must never
 * be labelled as one. Under reduced motion the hand, rainbow and dots hold
 * still and only the words change.
 */
import { WavingHand, HandShape } from "@/components/brand/Hands";
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
   * Draw only the waving hand, with no words, for use as an icon inside an
   * element that already states the status in text.
   */
  decorative?: boolean;
  className?: string;
}

const SIZES = {
  sm: { svg: "h-6 w-9", dot: "size-1", text: "text-[0.8125rem]" },
  md: { svg: "h-14 w-20", dot: "size-1.5", text: "text-sm" },
  lg: { svg: "h-24 w-36", dot: "size-2", text: "text-base" },
};

/* Three rings: radius, colour, and a sliding highlight. */
const RINGS = [
  { r: 51, color: "#1C4FD8", pill: "#5DBB80", from: 150, to: 110 },
  { r: 41, color: "#F59CC4", pill: "#F0322B", from: 70, to: 32 },
  { r: 31, color: "#FFC414", pill: "#FF6A1A", from: 130, to: 92 },
];

function arc(r: number, from: number, to: number) {
  const p = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(60 + r * Math.cos(a)).toFixed(2)} ${(82 - r * Math.sin(a)).toFixed(2)}`;
  };
  return `M${p(from)}A${r} ${r} 0 0 1 ${p(to)}`;
}

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

  if (decorative) {
    return <WavingHand color="sun" cuff={inverse ? "#FFFFFF" : "#1C4FD8"} motion="wave" className={cn("size-5", className)} />;
  }

  return (
    <div
      role={live ? "status" : undefined}
      className={cn("inline-flex items-center", layout === "stack" ? "flex-col gap-2 text-center" : "flex-row gap-2.5", className)}
    >
      <svg viewBox="0 0 120 84" aria-hidden className={cn(s.svg, "shrink-0 overflow-visible")}>
        {RINGS.map((ring, i) => (
          <g key={ring.r}>
            <path d={arc(ring.r, 180, 0)} fill="none" stroke={ring.color} strokeWidth="10.4" />
            <g
              className={reduced ? undefined : "animate-arc-slide"}
              style={{
                transformBox: "view-box",
                transformOrigin: "60px 82px",
                ["--slide" as string]: i % 2 ? "-22deg" : "24deg",
                animationDuration: `${2.4 + i * 0.5}s`,
              }}
            >
              <path d={arc(ring.r, ring.from, ring.to)} fill="none" stroke={ring.pill} strokeWidth="10" strokeLinecap="round" />
            </g>
          </g>
        ))}
        <g className={reduced ? undefined : "animate-hand-wave"} style={{ transformBox: "view-box", transformOrigin: "60px 84px" }}>
          <rect x="49" y="74" width="22" height="12" rx="4" fill={inverse ? "#FFFFFF" : "#011638"} />
          <g transform="translate(60 76) scale(0.5)">
            <HandShape color="white" />
          </g>
        </g>
      </svg>

      <span className={cn("inline-flex items-center gap-2 font-bold", s.text, inverse ? "text-white" : "text-navy", hideLabel && "sr-only")}>
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
