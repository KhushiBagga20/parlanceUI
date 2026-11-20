import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { AudioLines, Hand, History, LifeBuoy, Settings } from "lucide-react";
import { cn } from "@/lib/cn";
import { AccessibilityMenu } from "./AccessibilityMenu";
import { Logo } from "./Logo";

/* Each direction keeps its colour everywhere: coral for Speech → Sign,
   mint for Sign → Text. The words always carry the meaning too. */
const MODES = [
  { to: "/app/speech-to-sign", from: "Speech", target: "Sign", icon: AudioLines, pill: "bg-coral-100", chip: "bg-coral-400" },
  { to: "/app/sign-to-text", from: "Sign", target: "Text", icon: Hand, pill: "bg-mint-100", chip: "bg-mint-400" },
];

const TOOLS = [
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/settings", label: "Settings", icon: Settings },
  { to: "/app/help", label: "Help", icon: LifeBuoy },
];

export function AppHeader() {
  const { pathname } = useLocation();
  const [floating, setFloating] = useState(false);

  // Same behaviour as the site header: position only, with hysteresis.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setFloating((was) => (was ? y > 12 : y > 40));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 h-16 pt-[env(safe-area-inset-top)]">
      <div
        className={cn(
          "mx-auto flex items-stretch justify-between gap-4 border transition-[max-width,translate,height,padding,background-color,border-color,box-shadow,border-radius] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          floating
            ? "h-[3.25rem] max-w-[min(72rem,calc(100%-1.25rem))] translate-y-2.5 rounded-[1.625rem] border-line bg-surface/95 pr-1.5 pl-4 shadow-[0_1px_2px_rgb(1_22_56/0.06),0_12px_32px_-14px_rgb(1_22_56/0.28)] backdrop-blur-sm sm:pl-5 md:h-14 md:translate-y-3 md:rounded-[1.75rem] md:pr-2"
            : "h-16 max-w-full translate-y-0 rounded-none border-transparent border-b-line bg-surface/95 px-4 shadow-none sm:px-6",
        )}
      >
        <div className="flex min-w-0 items-center gap-4 lg:gap-8">
          {/* Between md and lg the direction switcher needs the room, even at large text sizes. */}
          <Logo wordmarkClassName="md:max-lg:sr-only" />
          <nav aria-label="Translation direction" className="hidden md:block">
            <ul className="flex items-center gap-1 rounded-full bg-subtle p-1 ring-1 ring-line">
              {MODES.map(({ to, from, target, icon: Icon, pill, chip }) => {
                const active = pathname.startsWith(to);
                return (
                  <li key={to} className="relative flex">
                    {active && (
                      <motion.span
                        aria-hidden
                        layoutId="app-mode-indicator"
                        className={cn("absolute inset-0 rounded-full shadow-sm ring-1 ring-navy/10", pill)}
                        transition={{ type: "spring", stiffness: 420, damping: 38 }}
                      />
                    )}
                    <NavLink
                      to={to}
                      className={cn(
                        "relative flex h-9 items-center gap-2 rounded-full px-3 py-1 text-[0.9375rem] font-semibold whitespace-nowrap transition-colors lg:pr-3.5 lg:pl-1",
                        active ? "text-navy" : "text-ink-2 hover:text-navy",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "hidden size-7 items-center justify-center rounded-full transition-colors lg:inline-flex",
                          active ? cn(chip, "text-navy") : "bg-surface text-ink-3",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span>{from}</span>
                      <span aria-hidden className="text-ink-3">
                        →
                      </span>
                      <span className="sr-only">to</span>
                      <span>{target}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <nav aria-label="Workspace" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {TOOLS.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    title={label}
                    className={({ isActive }) =>
                      cn(
                        "press inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold",
                        isActive ? "bg-navy text-white" : "text-ink-2 hover:bg-butter-100 hover:text-navy",
                      )
                    }
                  >
                    <Icon className="size-4" aria-hidden />
                    <span className="sr-only xl:not-sr-only">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <NavLink
            to="/app/help"
            aria-label="Help"
            title="Help"
            className={({ isActive }) =>
              cn(
                "press inline-flex size-11 items-center justify-center rounded-full md:hidden",
                isActive ? "bg-navy text-white" : "text-ink-2 hover:bg-butter-100",
              )
            }
          >
            <LifeBuoy className="size-5" aria-hidden />
          </NavLink>
          <div className="ml-2 flex items-center">
            <AccessibilityMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
