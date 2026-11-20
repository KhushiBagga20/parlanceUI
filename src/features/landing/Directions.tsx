import { Link } from "react-router-dom";
import { ArrowRight, AudioLines, Camera, Mic, ScanFace } from "lucide-react";
import { Pal } from "@/components/brand/Pal";
import { RainbowArch } from "@/components/brand/RainbowArch";
import { WavingHand } from "@/components/brand/Hands";
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
    block: "bg-tangerine-400 text-navy",
    muted: "text-navy/80",
    step: "bg-navy text-tangerine-400",
    cta: "bg-navy text-white hover:bg-cobalt-500",
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
    block: "bg-forest-400 text-white",
    muted: "text-white/85",
    step: "bg-white text-forest-400",
    cta: "bg-white text-navy hover:bg-sun-100",
  },
] as const;

/** Speech → Sign art: a person with a phone, a speech bubble, a small rainbow. Not a sign. */
function SpeechArt() {
  return (
    <div className="relative h-44 w-52 shrink-0" aria-hidden>
      <RainbowArch rings={4} opening={0.48} offset={3} className="absolute bottom-0 left-1/2 w-52 -translate-x-1/2" />
      <Pal pose="hold" outfit="cobalt" skin="medium" hair="short" className="absolute bottom-0 left-1/2 h-32 -translate-x-1/2" />
      <span className="absolute top-0 left-0 rounded-[1.25rem] rounded-br-md bg-white px-3.5 py-2 text-sm font-extrabold text-navy">Hello!</span>
    </div>
  );
}

/** Sign → Text art: two flat hands in a camera frame. Abstract motion only, not a sign. */
function SignArt() {
  return (
    <div className="relative h-44 w-52 shrink-0" aria-hidden>
      <svg viewBox="0 0 208 176" className="absolute inset-0 size-full" fill="none">
        <path
          d="M14 44V24a10 10 0 0 1 10-10h20M194 44V24a10 10 0 0 0-10-10h-20M14 132v20a10 10 0 0 0 10 10h20M194 132v20a10 10 0 0 1-10 10h-20"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
      <WavingHand color="sun" cuff="#011638" motion="bounce" className="absolute bottom-6 left-[6%] h-28" />
      <WavingHand
        color="bubblegum"
        cuff="#1C4FD8"
        motion="bounce"
        className="absolute right-[6%] bottom-6 h-28 -scale-x-100"
        style={{ animationDelay: "-0.6s" }}
      />
      <span className="absolute top-3 right-6 inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-xs font-extrabold text-white">
        <span className="size-2 rounded-full bg-tomato-400" /> Camera on
      </span>
    </div>
  );
}

/** Two equal ways in: whichever side of the conversation you are on. */
export function Directions() {
  return (
    <section aria-labelledby="directions-title" className="relative bg-paper pt-8 pb-20 sm:pb-28">
      <div className="container-wide">
        <Reveal className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-sun-400 px-3.5 py-1 text-[0.8125rem] font-extrabold text-navy">
              Start here
            </p>
            <h2 id="directions-title" className="text-section mt-4">
              Two ways in. Pick your side.
            </h2>
          </div>
          <p className="max-w-md text-[1.0625rem] leading-7 text-ink-2">
            Both directions work on the same screen, so two people can take turns. You can switch at any time from the top of
            the studio.
          </p>
        </Reveal>

        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {DIRECTIONS.map((d, i) => {
            const Art = i === 0 ? SpeechArt : SignArt;
            return (
              <Reveal as="li" key={d.to} delay={i * 90} className="flex">
                <article
                  className={cn(
                    "group grain relative flex w-full flex-col overflow-hidden rounded-[2.25rem] p-6 transition-[translate] duration-300 has-[:focus-visible]:outline-4 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-cobalt-400 has-[:focus-visible]:outline-solid hover:-translate-y-1 sm:p-9",
                    d.block,
                  )}
                >
                  <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[0.8125rem] font-extrabold text-navy">
                        <d.whoIcon className="size-3.5" aria-hidden />
                        {d.who}
                      </p>
                      <h3 className="mt-4 text-[2.5rem] leading-[0.95] font-extrabold tracking-[-0.05em] text-current sm:text-[3.25rem]">
                        {d.from}
                        <span aria-hidden> →</span>
                        <span className="sr-only"> to</span>
                        <br />
                        {d.target}
                      </h3>
                    </div>
                    <Art />
                  </div>
                  <div className="relative z-10 mt-6 flex flex-1 flex-col">
                    <p className={cn("max-w-md text-[1.0625rem] leading-7 font-medium", d.muted)}>{d.body}</p>
                    <ol className="mt-5 space-y-2.5">
                      {d.steps.map((step, n) => (
                        <li key={step} className="flex items-center gap-3 text-[0.9375rem] font-extrabold">
                          <span className={cn("inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold tabular-nums", d.step)}>
                            {n + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                    {d.note && <p className={cn("mt-4 text-sm leading-6 font-semibold", d.muted)}>{d.note}</p>}
                    <div className="mt-auto pt-8">
                      <Link
                        to={d.to}
                        className={cn(
                          "press inline-flex h-13 w-fit items-center gap-2 rounded-full px-6 text-base font-extrabold after:absolute after:inset-0 after:content-[''] focus-visible:outline-none",
                          d.cta,
                        )}
                      >
                        <d.icon className="size-5" aria-hidden />
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
