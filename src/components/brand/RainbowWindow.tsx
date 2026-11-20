/**
 * An arched window framed by rainbow rings: concentric bands that rise from
 * the floor, curve over the top and come back down. It frames a standing
 * figure (the 3D signer) with calm, plain space behind the hands and face,
 * where signs must stay legible.
 *
 * The geometry is measured from the container, so the top stays a true
 * semicircle at any size. Decorative (aria-hidden); children render in the
 * opening. Pill segments can drift along the rings; never under reduced
 * motion, and best left still where signs are being read.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import { GRAIN, RAINBOW, RINGS } from "./RainbowArch";

/* Pills per ring, along the path: [start %, length %, from colour, to colour]. 0 is the left foot, 100 the right. */
const PILLS: [number, number, string, string][][] = [
  [[30, 14, RAINBOW.forest, RAINBOW.cobalt], [70, 12, RAINBOW.forest, RAINBOW.forest]],
  [[40, 13, RAINBOW.bubblegum, RAINBOW.cobalt]],
  [[22, 10, RAINBOW.tomato, RAINBOW.bubblegum], [62, 13, RAINBOW.bubblegum, RAINBOW.tomato]],
  [[48, 12, RAINBOW.sun, RAINBOW.tomato]],
  [[28, 12, RAINBOW.forest, RAINBOW.sun], [74, 10, RAINBOW.tangerine, RAINBOW.tomato]],
  [[52, 12, RAINBOW.bubblegum, RAINBOW.cobalt]],
  [[36, 12, RAINBOW.tomato, RAINBOW.bubblegum]],
  [[58, 12, RAINBOW.sun, RAINBOW.bubblegum]],
];

interface RainbowWindowProps {
  /** Number of rings, 1 to 8. */
  rings?: number;
  /** Total thickness of the rings, in px. */
  band?: number;
  /** Fill for the opening. */
  fill?: string;
  /** Let the pill segments drift. */
  animate?: boolean;
  /** Start from a different ring colour. */
  offset?: number;
  className?: string;
  /** Rendered inside the opening (absolutely positioned, inset by the band). */
  children?: ReactNode;
  /** Classes for the opening's wrapper. */
  innerClassName?: string;
}

function shape(w: number, h: number, inset: number) {
  const R = Math.min(w / 2, h);
  const r = Math.max(0, R - inset);
  const left = R;
  const right = w - R;
  return { R, r, left, right, cy: R };
}

/** An open path: left foot, up, over the top, down to the right foot. */
function ringPath(w: number, h: number, inset: number) {
  const { r, left, right, cy } = shape(w, h, inset);
  const x0 = left - r;
  const x1 = right + r;
  return `M${x0} ${h}L${x0} ${cy}A${r} ${r} 0 0 1 ${left} ${cy - r}L${right} ${cy - r}A${r} ${r} 0 0 1 ${x1} ${cy}L${x1} ${h}`;
}

function closed(w: number, h: number, inset: number) {
  return `${ringPath(w, h, inset)}Z`;
}

export function RainbowWindow({
  rings = 5,
  band = 56,
  fill,
  animate = false,
  offset = 0,
  className,
  children,
  innerClassName,
}: RainbowWindowProps) {
  const reduced = useReducedMotion();
  const raw = useId();
  const id = `rw-${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [visible, setVisible] = useState(true);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setSize({ w: node.clientWidth, h: node.clientHeight });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { w, h } = size;
  const count = Math.max(1, Math.min(8, rings));
  const thickness = Math.min(band, w / 4);
  const rw = thickness / count;
  const moving = animate && !reduced;
  const ready = w > 0 && h > 0;
  const radius = ready ? shape(w, h, thickness).r : 0;

  return (
    <div ref={ref} className={cn(!/\b(absolute|fixed|sticky)\b/.test(className ?? "") && "relative", className)}>
      {ready && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="absolute inset-0 overflow-hidden">
          <defs>
            {Array.from({ length: count }, (_, i) => {
              const ring = RINGS[(i + offset) % RINGS.length]!;
              return (
                <linearGradient key={`b${i}`} id={`${id}-b${i}`} gradientUnits="userSpaceOnUse" x1="0" x2={w} y1="0" y2="0">
                  <stop offset="0" stopColor={ring.base[0]} />
                  <stop offset="1" stopColor={ring.base[1]} />
                </linearGradient>
              );
            })}
            {Array.from({ length: count }, (_, i) =>
              (PILLS[(i + offset) % PILLS.length] ?? []).map((pill, j) => (
                <linearGradient key={`p${i}-${j}`} id={`${id}-p${i}-${j}`} gradientUnits="userSpaceOnUse" x1="0" x2={w} y1="0" y2="0">
                  <stop offset="0" stopColor={pill[2]} />
                  <stop offset="1" stopColor={pill[3]} />
                </linearGradient>
              )),
            )}
            <pattern id={`${id}-grain`} width="90" height="90" patternUnits="userSpaceOnUse">
              <image href={GRAIN} width="90" height="90" />
            </pattern>
          </defs>

          {fill && <path d={closed(w, h, thickness)} fill={fill} />}

          {Array.from({ length: count }, (_, i) => {
            const inset = (i + 0.5) * rw;
            const d = ringPath(w, h, inset);
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={`url(#${id}-b${i})`} strokeWidth={rw + 0.6} />
                {(PILLS[(i + offset) % PILLS.length] ?? []).map(([start, length], j) => {
                  const drift = (i + j) % 2 === 0 ? 6 : -5;
                  const style: CSSProperties = moving
                    ? ({
                        "--o0": `${-start}`,
                        "--o1": `${-(start + drift)}`,
                        animationDuration: `${9 + ((i * 3 + j * 5) % 7)}s`,
                        animationDelay: `${-((i * 1.7 + j) % 5)}s`,
                        animationPlayState: visible ? "running" : "paused",
                      } as CSSProperties)
                    : {};
                  return (
                    <path
                      key={j}
                      d={d}
                      pathLength={100}
                      fill="none"
                      stroke={`url(#${id}-p${i}-${j})`}
                      strokeWidth={rw - 0.4}
                      strokeLinecap="round"
                      strokeDasharray={`${length} 300`}
                      strokeDashoffset={-start}
                      className={moving ? "animate-dash-slide" : undefined}
                      style={style}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* print grain over the rings only */}
          <path
            d={`${closed(w, h, 0)}${closed(w, h, thickness)}`}
            fillRule="evenodd"
            fill={`url(#${id}-grain)`}
            opacity="0.3"
            style={{ mixBlendMode: "multiply" }}
          />
        </svg>
      )}
      <div
        className={cn("absolute bottom-0", innerClassName)}
        style={{ left: thickness, right: thickness, top: thickness, borderTopLeftRadius: radius, borderTopRightRadius: radius }}
      >
        {children}
      </div>
    </div>
  );
}
