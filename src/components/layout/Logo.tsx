import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

/**
 * The Parlance mark: two voices facing each other around a shared point.
 * The left voice is tangerine (speech), the right is green (sign), and the
 * point between them is sun.
 */
export function LogoMark({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="10" fill={inverse ? "#FFFFFF" : "#011638"} />
      <path d="M12.6 8.8c-3.4 1.8-5 4.4-5 7.2s1.6 5.4 5 7.2" fill="none" stroke="#FF6A1A" strokeWidth="3" strokeLinecap="round" />
      <path d="M19.4 8.8c3.4 1.8 5 4.4 5 7.2s-1.6 5.4-5 7.2" fill="none" stroke={inverse ? "#0B7A3E" : "#5DBB80"} strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.8" fill="#FFC414" />
    </svg>
  );
}

export function Logo({
  inverse = false,
  className,
  to = "/",
  wordmarkClassName,
}: {
  inverse?: boolean;
  className?: string;
  to?: string;
  /** Extra classes for the "Parlance" word, e.g. to hide it where space is tight. */
  wordmarkClassName?: string;
}) {
  return (
    <Link
      to={to}
      className={cn("inline-flex items-center gap-2.5 rounded-sm", className)}
      aria-label="Parlance home"
    >
      <LogoMark inverse={inverse} />
      <span className={cn("text-[1.25rem] font-extrabold tracking-[-0.035em]", inverse ? "text-white" : "text-navy", wordmarkClassName)}>
        Parlance
      </span>
    </Link>
  );
}
