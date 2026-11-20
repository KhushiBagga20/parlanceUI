/**
 * The hero's live stage: the real 3D signer between the Parlance arcs, driven
 * by the real grammar engine and motion library. Visitors can type their own
 * sentence; until they do, it cycles through a few short phrases.
 * Loaded as its own chunk (three.js).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { RainbowWindow } from "@/components/brand/RainbowWindow";
import { AvatarViewport } from "@/components/avatar/AvatarViewport";
import { announce } from "@/components/ui/Toaster";
import type { PlayerState, SignPlayer } from "@/avatar/playback";
import { prepareSpeech, type Translation } from "@/services/signs/prepareSpeech";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";

const DEMO_PHRASES = ["Good morning, welcome.", "Where is the pain?", "Do you want water?", "Thank you."];
const GAP_MS = 1600;

type Prepared = Translation & { input: string };

async function prepare(input: string, local = false): Promise<Prepared> {
  return { input, ...await prepareSpeech(input, { local }) };
}

export default function HeroStage({
  request,
  hold = false,
}: {
  request: { text: string; id: number } | null;
  /** Keep the signer at rest (while the welcome scene plays). */
  hold?: boolean;
}) {
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState<Prepared | null>(null);
  const [state, setState] = useState<PlayerState | null>(null);
  /** Cycle demo phrases automatically. */
  const [demo, setDemo] = useState(!reduced);
  const [demoIndex, setDemoIndex] = useState(0);
  /** The visitor has typed their own sentence. */
  const [userTook, setUserTook] = useState(false);
  /** Hand the queue to the signer. Under reduced motion, only after Play. */
  const [started, setStarted] = useState(!reduced);
  const [player, setPlayer] = useState<SignPlayer | null>(null);
  const [visible, setVisible] = useState(true);
  const hostRef = useRef<HTMLDivElement>(null);

  // Stop rendering when the hero scrolls away.
  useEffect(() => {
    const node = hostRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Demo phrases until the visitor types their own.
  useEffect(() => {
    if (userTook) return;
    let live = true;
    void prepare(DEMO_PHRASES[demoIndex % DEMO_PHRASES.length]!, true).then((p) => {
      if (!live) return;
      setState(null);
      setCurrent(p);
    });
    return () => {
      live = false;
    };
  }, [userTook, demoIndex]);

  // A visitor's own sentence takes over the stage.
  useEffect(() => {
    if (!request) return;
    let live = true;
    setDemo(false);
    setUserTook(true);
    setStarted(true);
    void prepare(request.text).then((p) => {
      if (!live) return;
      setState(null);
      setCurrent(p);
      const signed = p.queue.filter((q) => !q.missing).length;
      announce(
        p.queue.length === 0
          ? "Nothing in that sentence could be translated."
          : `Signing ${p.gloss.notation}. ${signed} of ${p.queue.length} words have a sign.`,
      );
    });
    return () => {
      live = false;
    };
  }, [request]);

  const onState = useCallback((next: PlayerState) => setState(next), []);
  useEffect(() => {
    if (!demo || !state?.finished || state.playing) return;
    const timer = window.setTimeout(() => setDemoIndex((i) => i + 1), GAP_MS);
    return () => window.clearTimeout(timer);
  }, [demo, state]);

  const queue = current?.queue;
  const active = state && queue?.length ? Math.min(state.index, queue.length - 1) : -1;
  const playing = !!state?.playing;

  return (
    <div ref={hostRef} className="relative h-full w-full">
      {/* The signer stands in an arched window of rainbow rings. The circle is
          where the welcome scene collapses into. */}
      <RainbowWindow
        rings={6}
        band={64}
        fill="#FFFFFF"
        animate
        className="absolute inset-x-[2%] top-0 bottom-[20%] sm:inset-x-[8%] lg:inset-x-[10%]"
      />
      <div
        aria-hidden
        data-intro-target
        className="pointer-events-none absolute top-[12%] left-1/2 aspect-square h-[60%] -translate-x-1/2 rounded-full"
      />

      <div className="absolute inset-x-[6%] top-0 bottom-[20%]">
        <AvatarViewport
          queue={started && !hold ? queue : undefined}
          presentation="figure"
          interactive={false}
          suspended={!visible}
          onState={onState}
          onPlayer={setPlayer}
          label={
            current
              ? `3D signer performing the ISL phrase ${current.gloss.notation}, translated from "${current.input}"`
              : "3D signer, resting"
          }
        />
      </div>

      {/* Left annotation, attached to the arc: what was said */}
      <div
        className="pointer-events-none absolute top-[8%] left-0 hidden w-[12rem] animate-float rounded-[1.5rem] rounded-bl-md bg-tangerine-400 px-4 py-3 xl:block"
        aria-hidden
      >
        <p className="text-xs font-extrabold tracking-[0.08em] text-navy/80 uppercase">You said</p>
        <p className="mt-1 text-[1.0625rem] leading-6 font-bold text-navy">{current ? current.input : "…"}</p>
      </div>

      {/* Right annotation, attached to the arc: grammar on the face */}
      <div
        className="pointer-events-none absolute top-[22%] right-0 hidden w-[12rem] animate-float rounded-[1.5rem] rounded-br-md bg-forest-400 px-4 py-3 text-right [animation-delay:-3s] xl:block"
        aria-hidden
      >
        <p className="flex items-center justify-end gap-1.5 text-xs font-extrabold tracking-[0.08em] text-white/85 uppercase">
          <span className="size-1.5 rounded-full bg-sun-400" />
          ISL gloss
        </p>
        <p className="mt-1 text-[0.9375rem] leading-6 font-bold tracking-[0.03em] text-white uppercase">
          {current?.gloss.notation || "…"}
        </p>
      </div>

      {/* Gloss rail with the gold point under the active sign */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3">
        <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5 px-2" aria-hidden>
          {current?.gloss.tokens.map((item, i) => (
            <span
              key={`${item.gloss}-${i}`}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm leading-none font-extrabold tracking-[0.04em] uppercase transition-colors duration-300 sm:h-10 sm:gap-2 sm:px-4 sm:text-lg",
                item.missing
                  ? "border-2 border-dashed border-ink-3/50 text-ink-3 line-through decoration-2"
                  : i === active
                    ? "bg-navy text-white"
                    : "bg-surface text-navy ring-2 ring-navy/10",
              )}
            >
              {i === active && !item.missing && <span className="size-2 rounded-full bg-sun-400" />}
              {item.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!current) return;
              if (!started) {
                setStarted(true);
                return;
              }
              if (demo) setDemo(false);
              player?.toggle();
            }}
            disabled={!player || !queue?.length}
            className="press inline-flex size-10 items-center justify-center rounded-full border-2 border-navy bg-surface text-navy hover:bg-sun-100 disabled:opacity-40"
            aria-label={playing ? "Pause the signer" : "Play the signer"}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />}
          </button>
          <button
            type="button"
            onClick={() => {
              if (demo) setDemo(false);
              if (!started) setStarted(true);
              else player?.restart();
            }}
            disabled={!player || !queue?.length}
            className="press inline-flex size-10 items-center justify-center rounded-full border-2 border-navy bg-surface text-navy hover:bg-sun-100 disabled:opacity-40"
            aria-label="Replay the phrase"
            title="Replay"
          >
            <RotateCcw className="size-3.5" aria-hidden />
          </button>
          <span className="ml-1 text-[0.8125rem] font-bold text-ink-2" aria-hidden>
            {!current ? "Preparing the signer…" : playing ? `Signing ${active + 1} of ${queue?.length ?? 0}` : demo ? "Next phrase…" : "Ready"}
          </span>
        </div>
      </div>
    </div>
  );
}
