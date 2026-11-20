import type { ComponentType } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";

export interface TabItem {
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  /** A route path, or a same-page anchor such as "#about". */
  to: string;
  /** Spoken name when the visible label uses symbols. */
  ariaLabel?: string;
}

interface MobileTabBarProps {
  items: TabItem[];
  label: string;
  /** Section id currently in view, for same-page anchors. */
  activeAnchor?: string | null;
}

/**
 * Bottom navigation for small screens. Pages reserve its height with the
 * `pb-safe-tabbar` utility, so it never covers content or controls.
 */
export function MobileTabBar({ items, label, activeAnchor }: MobileTabBarProps) {
  return (
    <nav
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-40 rounded-t-[1.5rem] border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_-20px_rgb(1_22_56/0.35)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const content = (active: boolean) => (
            <span
              className={cn(
                "relative flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] leading-4 transition-colors",
                active ? "font-bold text-navy" : "font-medium text-ink-3",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "inline-flex h-7 w-12 items-center justify-center rounded-full transition-[background-color,transform] duration-300",
                  active ? "scale-100 bg-butter-200" : "scale-90 bg-transparent",
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="max-w-full truncate px-1" aria-hidden={item.ariaLabel ? true : undefined}>
                {item.label}
              </span>
              {item.ariaLabel && <span className="sr-only">{item.ariaLabel}</span>}
            </span>
          );
          return (
            <li key={item.to}>
              {item.to.startsWith("#") ? (
                <a href={item.to} aria-current={activeAnchor === item.to.slice(1) ? "location" : undefined}>
                  {content(activeAnchor === item.to.slice(1))}
                </a>
              ) : (
                <NavLink to={item.to}>{({ isActive }) => content(isActive)}</NavLink>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
