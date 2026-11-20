import { lazy, Suspense, useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, AudioLines, Camera, Hand, Keyboard } from "lucide-react";
import { RainbowWindow } from "@/components/brand/RainbowWindow";
import { SigningLoader } from "@/components/ui/SigningLoader";
import { useIntro } from "./intro/introState";

const HeroStage = lazy(() => import("./HeroStage"));

const SUGGESTIONS = ["Where is the pain?", "I need water.", "मुझे पानी चाहिए"];

function StagePoster() {
  return (
    <div className="relative h-full w-full">
      <RainbowWindow rings={6} band={64} fill="#FFFFFF" className="absolute inset-x-[2%] top-0 bottom-[20%] sm:inset-x-[8%] lg:inset-x-[10%]" />
      <div
        aria-hidden
        data-intro-target
        className="pointer-events-none absolute top-[12%] left-1/2 aspect-square h-[60%] -translate-x-1/2 rounded-full"
      />
      <div className="absolute inset-x-0 top-[40%] flex justify-center">
        <SigningLoader label="Loading the 3D signer" size="md" />
      </div>
    </div>
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
    <section aria-labelledby="hero-title" className="intro-hold grain relative overflow-hidden bg-paper">
      {/* Flat colour blocks at the edges, as on a poster */}
      <div aria-hidden className="pointer-events-none absolute top-[44%] -left-28 size-56 rounded-full bg-bubblegum-400 sm:size-72" />
      <div aria-hidden className="pointer-events-none absolute -top-24 right-[8%] size-48 rounded-full bg-sun-400 max-lg:hidden" />
      <div
        className={
          "container-wide relative z-10 grid grid-cols-1 items-center gap-x-12 gap-y-8 pt-6 pb-14 sm:pt-10 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_auto] lg:gap-y-0 lg:py-10 " +
          "[grid-template-areas:'text'_'stage'_'try'] lg:[grid-template-areas:'text_stage'_'try_stage']"
        }
      >
        {/* Headline */}
        <div className="min-w-0 [grid-area:text] lg:self-end">
          <p className="inline-flex animate-rise items-center gap-2.5 rounded-full bg-navy py-1.5 pr-4 pl-1.5 text-sm font-bold text-white">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-sun-400 text-navy" aria-hidden>
              <Hand className="size-4" />
            </span>
            <span aria-hidden>Speech ⇄ Indian Sign Language</span>
            <span className="sr-only">Speech and Indian Sign Language, both ways</span>
          </p>
          <h1 id="hero-title" className="text-hero mt-6 sm:mt-7">
            <span className="block animate-rise-lg [animation-delay:60ms]">Two languages.</span>
            <span className="block animate-rise-lg [animation-delay:140ms]">
              <span className="relative isolate inline-block text-cobalt-400">
                One conversation.
                <span
                  aria-hidden
                  className="absolute inset-x-[-0.08em] bottom-[0.04em] -z-10 h-[0.36em] origin-left animate-pop rounded-full bg-sun-400 [animation-delay:600ms]"
                />
              </span>
            </span>
          </h1>
          <p className="mt-7 max-w-[34ch] animate-rise-lg text-[1.125rem] leading-[1.6] text-ink-2 [animation-delay:240ms] sm:text-[1.1875rem]">
            Parlance turns English and Hindi into Indian Sign Language and offers a camera workspace for sign recognition.
          </p>
        </div>

        {/* The live signer */}
        <div className="relative min-w-0 [grid-area:stage]">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[34rem] animate-fade [animation-delay:200ms] sm:aspect-square lg:aspect-auto lg:h-[min(78svh,46rem)] lg:max-w-none">
            <Suspense fallback={<StagePoster />}>
              <HeroStage request={request} hold={welcoming} />
            </Suspense>
          </div>
        </div>

        {/* Try it */}
        <div className="min-w-0 [grid-area:try] lg:self-start lg:pt-8">
          <form
            onSubmit={onSubmit}
            className="animate-rise-lg rounded-[2rem] border-2 border-navy bg-surface p-3 [animation-delay:340ms] sm:p-4"
          >
            <label htmlFor={inputId} className="flex items-center gap-2.5 px-1 text-sm font-bold text-navy">
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-tangerine-400 text-navy" aria-hidden>
                <Keyboard className="size-3.5" />
              </span>
              Type in English or Hindi and watch it signed
            </label>
            <div className="mt-3 flex items-stretch rounded-full bg-paper ring-2 ring-transparent transition-[box-shadow,background-color] focus-within:bg-surface focus-within:ring-cobalt-400">
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
                className="press m-1.5 inline-flex items-center gap-2 rounded-full bg-cobalt-400 px-5 text-[0.9375rem] font-bold text-white hover:bg-cobalt-500 disabled:bg-cobalt-200 disabled:text-cobalt-800"
              >
                Sign it <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 px-1 text-sm">
              <span className="mr-1 font-semibold text-ink-3">Or try</span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setDraft(s);
                    sign(s);
                  }}
                  className="press rounded-full bg-paper-2 px-3.5 py-1.5 font-bold text-navy hover:bg-sun-200"
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
              className="press group flex min-h-16 items-center gap-3 rounded-full bg-tangerine-400 py-2 pr-5 pl-2 text-navy hover:bg-tangerine-300"
            >
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-navy text-tangerine-400" aria-hidden>
                <AudioLines className="size-5" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-base font-extrabold whitespace-nowrap">
                  Speech <span aria-hidden>→</span>
                  <span className="sr-only">to</span> Sign
                </span>
                <span className="block text-[0.8125rem] font-semibold text-navy/80">Speak or type</span>
              </span>
              <ArrowRight className="ml-auto size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link
              to="/app/sign-to-text"
              className="press group flex min-h-16 items-center gap-3 rounded-full bg-forest-400 py-2 pr-5 pl-2 text-white hover:bg-forest-500"
            >
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-forest-400" aria-hidden>
                <Camera className="size-5" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-base font-extrabold whitespace-nowrap">
                  Sign <span aria-hidden>→</span>
                  <span className="sr-only">to</span> Text
                </span>
                <span className="block text-[0.8125rem] font-semibold text-white/85">Sign to the camera</span>
              </span>
              <ArrowRight className="ml-auto size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
