import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "butter" | "sky" | "mint" | "coral";

const TONES: Record<Tone, { block: string; disc: string }> = {
  butter: { block: "bg-butter-100", disc: "bg-butter-200" },
  sky: { block: "bg-sky-100", disc: "bg-sky-200" },
  mint: { block: "bg-mint-100", disc: "bg-mint-200" },
  coral: { block: "bg-coral-100", disc: "bg-coral-200" },
};

interface WorkspaceHeaderProps {
  title: string;
  description: string;
  meta?: ReactNode;
  action?: ReactNode;
  /** A small icon shown in a chip above the title. */
  icon?: ReactNode;
  tone?: Tone;
  /** A decorative illustration that sits on the bottom edge (wide screens). */
  illustration?: ReactNode;
}

/** A friendly colour-block header for the supporting pages. */
export function WorkspaceHeader({ title, description, meta, action, icon, tone = "butter", illustration }: WorkspaceHeaderProps) {
  const t = TONES[tone];
  return (
    <div className={cn("relative isolate overflow-hidden rounded-[2rem] px-6 py-7 sm:px-9 sm:py-9", t.block)}>
      <span aria-hidden className={cn("absolute -top-20 -right-16 -z-10 size-56 rounded-full", t.disc)} />
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0 max-w-2xl">
          {icon && (
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-surface text-royal shadow-xs [&_svg]:size-5" aria-hidden>
              {icon}
            </span>
          )}
          <h1 className={cn("text-[2.25rem] leading-[1.05] font-bold tracking-[-0.045em] sm:text-[3rem]", icon ? "mt-4" : undefined)}>{title}</h1>
          <p className="mt-3 max-w-2xl text-[1.0625rem] leading-7 text-ink-2">{description}</p>
          {(meta || action) && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {meta && <span className="text-sm font-semibold text-ink-2">{meta}</span>}
              {action}
            </div>
          )}
        </div>
        {illustration && (
          <div className="relative -mb-7 hidden shrink-0 self-end sm:-mb-9 sm:block" aria-hidden>
            {illustration}
          </div>
        )}
      </div>
    </div>
  );
}
