import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  /** A friendly illustration shown instead of the icon chip. */
  illustration?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, children, action, illustration, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      {illustration ? (
        <div className="relative flex h-32 w-40 items-end justify-center" aria-hidden>
          <span className="absolute bottom-0 h-24 w-36 rounded-full bg-butter-100" />
          <span className="relative">{illustration}</span>
        </div>
      ) : (
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-butter-100 text-royal [&_svg]:size-6">
          {icon}
        </span>
      )}
      <h3 className="mt-5 text-xl font-bold tracking-[-0.025em] text-navy">{title}</h3>
      {children && <div className="mt-1.5 max-w-sm text-[0.9375rem] leading-6 text-ink-2">{children}</div>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
