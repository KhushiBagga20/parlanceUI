import { Link } from "react-router-dom";
import { ArrowRight, AudioLines, Camera, Mic, ScanFace } from "lucide-react";
import { Pal } from "@/components/brand/Pal";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

const DIRECTIONS = [
  {
    to: "/app/speech-to-sign",
    from: "Speech",
    target: "Sign",
    who: "For the hearing person",
    whoIcon: Mic,
    body: "Say it or type it in English or Hindi. Remy, the 3D signer, performs it in Indian Sign Language, with the gloss shown alongside.",
    steps: ["Speak, type or pick a phrase", "Check the ISL gloss", "Watch, slow down or replay"],
    note: null,
    icon: AudioLines,
    block: "bg-coral-300",
    chip: "bg-coral-100 text-coral-800",
  },
  {
    to: "/app/sign-to-text",
    from: "Sign",
    target: "Text",
    who: "For the ISL signer",
    whoIcon: ScanFace,
    body: "Sign one word at a time to the camera. Parlance builds the sentence in large text and can read it aloud for the other person.",
    steps: ["Start the camera", "Sign one word at a time", "Read it, or hear it spoken"],
    note: "Recognition needs the Parlance recognition service running.",
    icon: Camera,
    block: "bg-mint-300",
    chip: "bg-mint-100 text-mint-800",
  },
] as const;

/** The illustration for each card. Neither pose is a sign. */
function SpeechArt() {
  return (
    <div className="relative h-full w-44 sm:w-52" aria-hidden>
      <span className="absolute right-2 bottom-0 size-36 rounded-full bg-coral-200 sm:size-40" />
      <Pal pose="hold" outfit="royal" skin="medium" hair="short" className="absolute right-4 bottom-0 h-36 sm:h-40" />
      <span className="absolute top-3 left-0 rounded-2xl rounded-br-sm bg-surface px-3 py-2 text-sm font-bold text-navy shadow-card">
        Hello!
      </span>
    </div>
  );
}

function SignArt() {
  return (
    <div className="relative h-full w-44 sm:w-52" aria-hidden>
      <span className="absolute right-2 bottom-0 size-36 rounded-full bg-mint-200 sm:size-40" />
      <Pal pose="rest" outfit="coral" skin="light" hair="bun" hairColor="brown" className="absolute right-6 bottom-0 h-34 sm:h-38" />
      {/* camera framing corners */}
      <svg viewBox="0 0 160 150" className="absolute right-0 bottom-0 h-40 w-44 sm:h-44 sm:w-52" fill="none">
        <path
          d="M14 34V18a6 6 0 0 1 6-6h16M146 34V18a6 6 0 0 0-6-6h-16M14 116v16a6 6 0 0 0 6 6h16M146 116v16a6 6 0 0 1-6 6h-16"
          stroke="#011638"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute top-3 left-0 inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-xs font-bold text-white shadow-card">
        <span className="size-2 rounded-full bg-gold" /> Camera on
      </span>
    </div>
  );
}

/** Two equal ways in: whichever side of the conversation you are on. */
export function Directions() {
  return (
    <section aria-labelledby="directions-title" className="relative bg-cream pt-4 pb-20 sm:pb-24">
      <div className="container-wide">
        <Reveal className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-butter-200 px-3.5 py-1 text-[0.8125rem] font-bold text-navy">
            Start here
          </p>
          <h2 id="directions-title" className="mt-4 text-[2rem] leading-[1.05] font-bold tracking-[-0.04em] sm:text-[2.75rem]">
            Two ways in. Pick your side of the conversation.
          </h2>
          <p className="mt-3 text-[1.0625rem] leading-7 text-ink-2">
            Both directions work on the same screen, so two people can take turns. You can switch at any time from the top of the
            studio.
          </p>
        </Reveal>

        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {DIRECTIONS.map((d, i) => {
            const Art = i === 0 ? SpeechArt : SignArt;
            return (
              <Reveal as="li" key={d.to} delay={i * 90} className="flex">
                <article className="group relative flex w-full flex-col overflow-hidden rounded-[2rem] bg-surface shadow-card ring-1 ring-line transition-[translate,box-shadow] duration-300 focus-within:ring-2 focus-within:ring-royal hover:-translate-y-1 hover:shadow-lg">
                  <div className={cn("relative flex h-48 items-stretch justify-between gap-3 overflow-hidden px-6 pt-6 sm:h-52 sm:px-8", d.block)}>
                    <div className="relative z-10 min-w-0 pb-6">
                      <p className="inline-flex items-center gap-1.5 rounded-full bg-surface/85 px-3 py-1 text-[0.8125rem] font-bold text-navy">
                        <d.whoIcon className="size-3.5" aria-hidden />
                        {d.who}
                      </p>
                      <h3 className="mt-3 text-[2.125rem] leading-none font-bold tracking-[-0.045em] text-navy sm:text-[2.75rem]">
                        {d.from} <span aria-hidden>→</span>
                        <span className="sr-only">to</span> {d.target}
                      </h3>
                    </div>
                    <Art />
                  </div>
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <p className="text-[1.0625rem] leading-7 text-ink-2">{d.body}</p>
                    <ol className="mt-5 space-y-2.5">
                      {d.steps.map((step, n) => (
                        <li key={step} className="flex items-center gap-3 text-[0.9375rem] font-semibold text-navy">
                          <span className={cn("inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums", d.chip)}>
                            {n + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                    {d.note && <p className="mt-4 text-sm leading-6 text-ink-3">{d.note}</p>}
                    <div className="mt-auto pt-7">
                      <Link
                        to={d.to}
                        className="press inline-flex h-12 w-fit items-center gap-2 rounded-full bg-navy px-6 text-[0.9375rem] font-semibold text-white after:absolute after:inset-0 after:content-[''] hover:bg-royal"
                      >
                        <d.icon className="size-[1.125rem]" aria-hidden />
                        Open {d.from} <span aria-hidden>→</span>
                        <span className="sr-only">to</span> {d.target}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
