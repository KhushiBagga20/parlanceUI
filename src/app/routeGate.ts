/**
 * Page-change fingerspelling. The root route's loader waits just long enough
 * for <RouteTransition> to spell the destination's word, so the new page
 * swaps in while the overlay still covers it. Only real page changes wait:
 * hash links, search-param changes and reduced motion pass straight through.
 */
import type { LoaderFunctionArgs, ShouldRevalidateFunctionArgs } from "react-router-dom";
import { cleanWord } from "@/components/brand/SignHands";

const WORDS: [prefix: string, word: string][] = [
  ["/app/speech-to-sign", "SIGN"],
  ["/app/sign-to-text", "READ"],
  ["/app/learn", "ABC"],
  ["/app/history", "LOG"],
  ["/app/settings", "SET"],
  ["/app/help", "HELP"],
  ["/app", "SIGN"],
];

export function signFor(pathname: string) {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/") return "HI";
  return WORDS.find(([p]) => clean === p || clean.startsWith(`${p}/`))?.[1] ?? "GO";
}

export const IRIS_MS = 520;
export const LETTER_MS = 360;

export function holdFor(word: string) {
  return IRIS_MS + cleanWord(word).length * LETTER_MS + 120;
}

function prefersReducedMotion() {
  if (typeof document === "undefined") return true;
  const setting = document.documentElement.dataset.motion;
  if (setting === "reduce") return true;
  if (setting === "full") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

let firstLoad = true;

export async function routeGate({ request }: LoaderFunctionArgs) {
  // The first load is covered by the HydrateFallback and the intro instead.
  if (firstLoad) {
    firstLoad = false;
    return null;
  }
  if (prefersReducedMotion()) return null;
  const path = new URL(request.url).pathname;
  await new Promise((resolve) => setTimeout(resolve, holdFor(signFor(path))));
  return null;
}

/** Re-run the gate only when the pathname changes. */
export function shouldGate({ currentUrl, nextUrl }: ShouldRevalidateFunctionArgs) {
  return currentUrl.pathname !== nextUrl.pathname;
}
