import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, AudioLines, Camera, Hand, Play, Users, Workflow } from "lucide-react";
import { Reach } from "@/components/brand/Hands";
import { RainbowArch } from "@/components/brand/RainbowArch";
import { Logo } from "./Logo";

/** The wireframe's four destinations, as the footer's index. */
const DESTINATIONS = [
  { to: "/app/speech-to-sign", icon: AudioLines, title: "Speech → Sign", spoken: "Speech to sign", note: "Speak or type; the signer answers in ISL.", chip: "bg-tangerine-400 text-navy" },
  { to: "/app/sign-to-text", icon: Hand, title: "Sign → Text", spoken: "Sign to text", note: "Sign to the camera; read and hear the reply.", chip: "bg-forest-400 text-white" },
  { to: "/#how-it-works", icon: Workflow, title: "How it works", spoken: "How it works", note: "Both pipelines, step by step.", chip: "bg-cobalt-400 text-white" },
  { to: "/#about", icon: Users, title: "About us", spoken: "About us", note: "Why we built it, and who we are.", chip: "bg-bubblegum-400 text-navy" },
];

const MORE = [
  { to: "/app/history", label: "History" },
  { to: "/app/settings", label: "Settings" },
  { to: "/app/help#vocabulary", label: "Supported signs" },
  { to: "/app/help#limits", label: "What it can't do" },
  { to: "/app/help#privacy", label: "Privacy" },
  { to: "/app/help", label: "Help" },
];

export function SiteFooter({ onReplayIntro }: { onReplayIntro?: () => void }) {
  return (
    <footer>
      {/* The closing poster: arms reach in from every edge towards the invitation. */}
      <section aria-labelledby="footer-cta" className="grain relative overflow-hidden bg-sun-400 py-28 sm:py-36">
        <Reach side="left" at="24%" tilt={-8} hand="bubblegum" sleeve="#0B7A3E" reach="clamp(5.5rem, 10vw, 11rem)" size="clamp(12rem, 20vw, 20rem)" />
        <Reach side="right" at="34%" tilt={10} hand="white" sleeve="#1C4FD8" reach="clamp(5.5rem, 10vw, 11rem)" size="clamp(12rem, 20vw, 20rem)" delay={1.5} />
        <Reach side="top" at="16%" tilt={14} hand="cobalt" sleeve="#FF6A1A" reach="clamp(5rem, 8vw, 9rem)" size="clamp(11rem, 17vw, 17rem)" delay={3} className="max-sm:hidden" />
        <Reach side="bottom" at="82%" tilt={-12} hand="tangerine" sleeve="#B8A4E6" reach="clamp(5rem, 8vw, 9rem)" size="clamp(11rem, 17vw, 17rem)" delay={2.2} />
        <Reach side="top" at="78%" tilt={-10} hand="sun" sleeve="#011638" cuff="#F59CC4" reach="clamp(5rem, 7vw, 8rem)" size="clamp(11rem, 16vw, 16rem)" delay={4} className="max-md:hidden" />
        <Reach side="bottom" at="14%" tilt={8} hand="lilac" sleeve="#F0322B" reach="clamp(5rem, 7vw, 8rem)" size="clamp(11rem, 16vw, 16rem)" delay={0.7} className="max-md:hidden" />

        <div className="container-wide relative z-10 flex flex-col items-center text-center">
          <h2 id="footer-cta" className="text-section max-w-3xl text-navy">
            Start a conversation.
            <span className="block">Both of you, understood.</span>
          </h2>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/app/speech-to-sign"
              className="press inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-navy px-7 text-base font-bold text-white hover:bg-cobalt-500"
            >
              <AudioLines className="size-5 text-tangerine-400" aria-hidden />
              Speech <span aria-hidden>→</span>
              <span className="sr-only">to</span> Sign
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              to="/app/sign-to-text"
              className="press inline-flex h-14 items-center justify-center gap-2.5 rounded-full border-2 border-navy bg-white px-7 text-base font-bold text-navy hover:bg-sun-100"
            >
              <Camera className="size-5 text-forest-400" aria-hidden />
              Sign <span aria-hidden>→</span>
              <span className="sr-only">to</span> Text
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <div className="relative overflow-hidden bg-navy pb-safe-tabbar text-white">
        <RainbowArch rings={7} opening={0.32} offset={1} className="pointer-events-none absolute -right-24 -bottom-2 w-[30rem] opacity-90 max-lg:hidden" />
        <div className="container-wide relative">
          <nav aria-label="Footer" className="grid gap-3 pt-14 sm:grid-cols-2 lg:grid-cols-4">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.to}
                to={d.to}
                className="group flex flex-col gap-2 rounded-[1.5rem] bg-white/[0.06] p-6 ring-1 ring-white/10 transition-colors hover:bg-white/[0.1] focus-visible:outline-gold"
              >
                <span className={`mb-2 inline-flex size-11 items-center justify-center rounded-full ${d.chip}`} aria-hidden>
                  <d.icon className="size-5" />
                </span>
                <span className="flex items-center justify-between gap-3 text-[1.375rem] font-extrabold tracking-[-0.035em]">
                  <span aria-hidden>{d.title}</span>
                  <span className="sr-only">{d.spoken}</span>
                  <ArrowUpRight
                    className="size-5 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold"
                    aria-hidden
                  />
                </span>
                <span className="text-[0.9375rem] leading-6 text-white/70">{d.note}</span>
              </Link>
            ))}
          </nav>

          <div className="grid gap-10 border-t border-white/15 py-10 mt-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Logo inverse />
              <p className="mt-4 max-w-sm text-[0.9375rem] leading-7 text-white/70">
                Two-way communication between spoken English and Indian Sign Language. Built to support qualified
                interpreters, never to replace them.
              </p>
            </div>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:col-span-7 lg:justify-items-start">
              {MORE.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex min-h-10 items-center text-[0.9375rem] font-semibold text-white/80 transition-colors hover:text-gold focus-visible:outline-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2 border-t border-white/15 py-6 text-[0.8125rem] text-white/60 sm:flex-row sm:justify-between">
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
              Team APX_GP · The Builder&rsquo;s Theory 1.0
              {onReplayIntro && (
                <button
                  type="button"
                  onClick={onReplayIntro}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-full px-1 text-white/80 underline decoration-white/30 underline-offset-4 transition-colors hover:text-gold hover:decoration-gold focus-visible:outline-gold"
                >
                  <Play className="size-3" aria-hidden /> Replay the welcome
                </button>
              )}
            </p>
            <p>No video is stored or sent. Sign motion from the ISLRTC dictionary.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
