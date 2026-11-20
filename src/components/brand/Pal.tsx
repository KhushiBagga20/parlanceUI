/**
 * Friendly illustrated people for invitations and empty states: flat shapes,
 * round heads, the Parlance palette. Purely decorative (aria-hidden).
 *
 * The poses are deliberately not signs. "rest" has the arms down, "wave" is a
 * casual open-hand hello wave, and "hold" holds a phone. Never describe or
 * label any of them as an ISL sign.
 */
import { useId } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";

export type PalPose = "rest" | "wave" | "hold";

const SKIN = { light: "#F6D2B8", medium: "#D9A27A", deep: "#8D5A3B" } as const;
const OUTFIT = {
  royal: "#0D21A1",
  coral: "#FF8A65",
  mint: "#4CC594",
  sky: "#5B7FF0",
  butter: "#FFD56B",
  navy: "#011638",
} as const;
const HAIR_COLOR = { navy: "#011638", brown: "#4A2C1A", ink: "#141414" } as const;

interface PalProps {
  pose?: PalPose;
  outfit?: keyof typeof OUTFIT;
  skin?: keyof typeof SKIN;
  hair?: "short" | "bun" | "curly";
  hairColor?: keyof typeof HAIR_COLOR;
  /** Gentle idle motion (a bob, and the wave). Off under reduced motion. */
  animate?: boolean;
  className?: string;
}

function Hair({ style, fill }: { style: NonNullable<PalProps["hair"]>; fill: string }) {
  if (style === "curly") {
    return (
      <g fill={fill}>
        {[
          [34, 46, 10],
          [40, 34, 11],
          [52, 27, 11],
          [66, 26, 11],
          [79, 33, 11],
          [86, 45, 10],
        ].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
        ))}
      </g>
    );
  }
  return (
    <g fill={fill}>
      <path d="M31.5 55C29 35 42 25 60 25s31 10 28.5 30c-3-7-9-11.5-16-13-6 4.5-17 6.5-28 4.5-6 1.5-10.5 4.5-13 8.5Z" />
      {style === "bun" && <circle cx="60" cy="22" r="9.5" />}
    </g>
  );
}

export function Pal({
  pose = "rest",
  outfit = "royal",
  skin = "light",
  hair = "short",
  hairColor = "navy",
  animate = false,
  className,
}: PalProps) {
  const reduced = useReducedMotion();
  const moving = animate && !reduced;
  const clipId = `pal-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const body = OUTFIT[outfit];
  const tone = SKIN[skin];

  return (
    <svg viewBox="0 0 120 140" aria-hidden className={cn("shrink-0 overflow-visible", className)}>
      <g className={moving ? "animate-bob" : undefined}>
        {/* body */}
        <path d="M17 140c0-35 18-55 43-55s43 20 43 55Z" fill={body} />
        <path d="M49 86.5a11 8 0 0 0 22 0Z" fill={tone} />
        {pose === "rest" && (
          <g stroke="#011638" strokeOpacity="0.16" strokeWidth="2" strokeLinecap="round">
            <path d="M35 112v26M85 112v26" />
          </g>
        )}

        {/* head */}
        <circle cx="32.5" cy="58" r="5" fill={tone} />
        <circle cx="87.5" cy="58" r="5" fill={tone} />
        <circle cx="60" cy="55" r="27.5" fill={tone} />
        <Hair style={hair} fill={HAIR_COLOR[hairColor]} />
        <ellipse cx="50.5" cy="57" rx="2.8" ry="3.4" fill="#011638" />
        <ellipse cx="69.5" cy="57" rx="2.8" ry="3.4" fill="#011638" />
        <circle cx="44.5" cy="66" r="4" fill="#FF8A65" opacity="0.35" />
        <circle cx="75.5" cy="66" r="4" fill="#FF8A65" opacity="0.35" />
        <path d="M53.5 67q6.5 5.5 13 0" fill="none" stroke="#011638" strokeWidth="2.4" strokeLinecap="round" />

        {pose === "wave" && (
          <>
            <path d="M35 112v26" stroke="#011638" strokeOpacity="0.16" strokeWidth="2" strokeLinecap="round" />
            {/* A casual hello wave of an open hand, from the shoulder. */}
            <g
              className={moving ? "animate-hand-wave" : undefined}
              style={{ transformBox: "view-box", transformOrigin: "88px 104px" }}
            >
              <path d="M87 104 103 74" stroke={body} strokeWidth="13" strokeLinecap="round" />
              <rect x="97" y="51" width="15" height="20" rx="7.5" fill={tone} />
              <rect x="93.5" y="61" width="6.5" height="11" rx="3.25" fill={tone} transform="rotate(-32 96.75 66.5)" />
            </g>
          </>
        )}

        {pose === "hold" && (
          <g>
            <defs>
              <clipPath id={clipId}>
                <rect x="47" y="93" width="26" height="40" rx="5" />
              </clipPath>
            </defs>
            <rect x="45" y="91" width="30" height="44" rx="6.5" fill="#011638" />
            <g clipPath={`url(#${clipId})`}>
              <rect x="47" y="93" width="26" height="40" fill="#FFFFFF" />
              <rect x="50.5" y="99" width="16" height="7.5" rx="3.75" fill="#FFD56B" />
              <rect x="54" y="110" width="15.5" height="7.5" rx="3.75" fill="#A9E3C8" />
              <rect x="50.5" y="121" width="11" height="7.5" rx="3.75" fill="#FFC2AA" />
            </g>
            <circle cx="45.5" cy="115" r="6.5" fill={tone} />
            <circle cx="74.5" cy="115" r="6.5" fill={tone} />
          </g>
        )}
      </g>
    </svg>
  );
}
