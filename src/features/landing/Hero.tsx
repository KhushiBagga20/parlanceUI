import { lazy, Suspense, useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, AudioLines, Camera, Hand, Keyboard } from "lucide-react";
import { Arcs } from "@/components/brand/Arcs";
import { SigningLoader } from "@/components/ui/SigningLoader";
import { useIntro } from "./intro/introState";

const HeroStage = lazy(() => import("./HeroStage"));

const SUGGESTIONS = ["Where is the pain?", "I need water.", "मुझे पानी चाहिए"];

function StagePoster() {
  return (
    <div className="relative h-full w-full">
      <div
        aria-hidden
        data-intro-target
        className="absolute top-[1%] left-1/2 aspect-square h-[80%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#ffffff_0%,var(--color-stage-2)_55%,var(--color-stage)_88%,transparent_100%)]"
      />
      <Arcs point={false} className="absolute top-[1%] left-1/2 aspect-square h-[80%] -translate-x-1/2" tone="soft" />
      <svg viewBox="0 0 200 220" className="absolute bottom-[22%] left-1/2 h-[54%] -translate-x-1/2 text-sky-300" aria-hidden>
        <ellipse cx="100" cy="58" rx="26" ry="32" fill="currentColor" />
        <path d="M40 220c2-60 26-90 60-90s58 30 60 90z" fill="currentColor" />
      </svg>
      <div className="absolute inset-x-0 bottom-[6%] flex justify-center">
        <SigningLoader label="Loading the 3D signer" size="sm" layout="inline" className="rounded-full bg-surface/90 px-4 py-2 shadow-card" />
      </div>
    </div>
  );
}

/** A hand-drawn gold underline that writes itself in once the hero appears. */
function Swash() {
  return (
    <svg
      viewBox="0 0 320 24"
      preserveAspectRatio="none"
      aria-hidden
      className="absolute -bottom-[0.14em] left-[-2%] -z-10 h-[0.3em] w-[104%] overflow-visible"
    >
      <path
        d="M6 16C70 7 150 4 220 7c34 1.5 66 4.5 94 9"
        fill="none"
        stroke="#EEC643"
        strokeWidth="9"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        className="animate-draw [--len:1] [animation-delay:650ms] [animation-duration:900ms]"
      />
    </svg>
  );
}

export function Hero() {
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const [request, setRequest] = useState<{ text: string; id: number } | null>(null);
  const welcoming = useIntro((s) => s.phase !== "done");

  const sign = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setRequest({ text: value, id: Date.now() });
  };
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    sign(draft);
  };

  return (
    <section
      aria-labelledby="hero-title"
      className="intro-hold relative overflow-hidden bg-[linear-gradient(180deg,var(--color-butter-100)_0%,var(--color-butter-50)_55%,var(--color-cream)_100%)]"
    >
      {/* Colour blocks at the edges: one warm voice, one cool, meeting in the middle */}
      <div aria-hidden className="pointer-events-none absolute top-[38%] -left-24 size-56 rounded-full bg-coral-200/70 sm:size-72" />
      <div aria-hidden className="pointer-events-none absolute -right-28 bottom-[8%] size-64 rounded-full bg-mint-200/70 sm:size-80" />
      {/* Soft light behind the signer: the conversation's space */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[6%] right-[-18%] aspect-square w-[min(80rem,120vw)] rounded-full bg-[radial-gradient(closest-side,var(--color-sky-200)_0%,rgb(220_232_255/0.5)_45%,transparent_72%)] lg:right-[-12%] lg:w-[64rem]"
      />
      <div
        className={
          "container-wide relative grid grid-cols-1 items-center gap-x-12 gap-y-8 pt-6 pb-14 sm:pt-10 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_auto] lg:gap-y-0 lg:py-10 " +
          "[grid-template-areas:'text'_'stage'_'try'] lg:[grid-template-areas:'text_stage'_'try_stage']"
        }
      >
        {/* Headline */}
        <div className="min-w-0 [grid-area:text] lg:self-end">
          <p className="inline-flex animate-rise items-center gap-2.5 rounded-full bg-surface py-1.5 pr-4 pl-1.5 text-sm font-semibold text-navy shadow-xs ring-1 ring-butter-200">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-gold text-navy" aria-hidden>
              <Hand className="size-4" />
            </span>
            <span aria-hidden>Speech ⇄ Indian Sign Language</span>
            <span className="sr-only">Speech and Indian Sign Language, both ways</span>
          </p>
          <h1 id="hero-title" className="text-hero mt-6 sm:mt-7">
            <span className="block animate-rise-lg [animation-delay:60ms]">Two languages.</span>
            <span className="block animate-rise-lg [animation-delay:140ms]">
              <span className="relative isolate inline-block text-royal">
                One conversation.
                <Swash />
              </span>
            </span>
          </h1>
          <p className="mt-7 max-w-[34ch] animate-rise-lg text-[1.125rem] leading-[1.6] text-ink-2 [animation-delay:240ms] sm:text-[1.1875rem]">
            Parlance turns English and Hindi into Indian Sign Language and offers a camera workspace for sign recognition.
          </p>
        </div>

        {/* The live signer */}
        <div className="relative min-w-0 [grid-area:stage]">
          <div className="relative mx-auto aspect-square w-full max-w-[34rem] animate-fade [animation-delay:200ms] lg:aspect-auto lg:h-[min(78svh,46rem)] lg:max-w-none">
            <Suspense fallback={<StagePoster />}>
              <HeroStage request={request} hold={welcoming} />
            </Suspense>
          </div>
        </div>

        {/* Try it */}
        <div className="min-w-0 [grid-area:try] lg:self-start lg:pt-8">
          <form
            onSubmit={onSubmit}
            className="animate-rise-lg rounded-[1.75rem] bg-surface p-3 shadow-[0_1px_2px_rgb(1_22_56/0.05),0_22px_44px_-24px_rgb(1_22_56/0.4)] ring-1 ring-butter-200 [animation-delay:340ms] sm:p-4"
          >
            <label htmlFor={inputId} className="flex items-center gap-2.5 px-1 text-sm font-semibold text-ink-2">
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-coral-100 text-coral-800" aria-hidden>
                <Keyboard className="size-3.5" />
              </span>
              Type in English or Hindi and watch it signed
            </label>
            <div className="mt-3 flex items-stretch rounded-full bg-cream ring-1 ring-line transition-[box-shadow,background-color] focus-within:bg-surface focus-within:ring-2 focus-within:ring-royal">
              <input
                id={inputId}
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 120))}
                placeholder="Where is the pain?"
                autoComplete="off"
                className="h-14 min-w-0 flex-1 bg-transparent pr-2 pl-5 text-[1.0625rem] text-ink outline-none placeholder:text-ink-3 focus-visible:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="press m-1.5 inline-flex items-center gap-2 rounded-full bg-royal px-5 text-[0.9375rem] font-semibold text-white hover:bg-brand-700 disabled:bg-sky-400"
              >
                Sign it <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 px-1 text-sm">
              <span className="mr-1 text-ink-3">Or try</span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setDraft(s);
                    sign(s);
                  }}
                  className="press rounded-full bg-sky-50 px-3.5 py-1.5 font-semibold text-royal ring-1 ring-sky-200 hover:bg-sky-100 hover:ring-royal/40"
                >
                  {s}
                </button>
              ))}
            </div>
          </form>

          {/* Both directions, as equals */}
          <div className="mt-6 grid animate-rise-lg gap-3 [animation-delay:420ms] sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <Link
              to="/app/speech-to-sign"
              className="press group flex min-h-14 items-center gap-3 rounded-full bg-navy py-2 pr-5 pl-2 text-white hover:bg-royal"
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-coral-400 text-navy" aria-hidden>
                <AudioLines className="size-5" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-[0.9375rem] font-bold whitespace-nowrap">
                  Speech <span aria-hidden>→</span>
                  <span className="sr-only">to</span> Sign
                </span>
                <span className="block text-[0.8125rem] text-white/75">Speak or type</span>
              </span>
              <ArrowRight className="ml-auto size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link
              to="/app/sign-to-text"
              className="press group flex min-h-14 items-center gap-3 rounded-full bg-surface py-2 pr-5 pl-2 text-navy ring-1 ring-line-strong hover:ring-navy/40"
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-mint-300 text-navy" aria-hidden>
                <Camera className="size-5" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-[0.9375rem] font-bold whitespace-nowrap">
                  Sign <span aria-hidden>→</span>
                  <span className="sr-only">to</span> Text
                </span>
                <span className="block text-[0.8125rem] text-ink-3">Sign to the camera</span>
              </span>
              <ArrowRight className="ml-auto size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
