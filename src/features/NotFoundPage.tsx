import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { Pal } from "@/components/brand/Pal";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="container-page flex h-16 items-center">
        <Logo />
      </header>
      <main id="main" className="container-page flex flex-1 flex-col-reverse items-start justify-center gap-10 py-16 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center rounded-full bg-butter-200 px-3 py-1 text-[0.8125rem] font-bold text-navy">Error 404</p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">This page doesn&rsquo;t exist.</h1>
          <p className="mt-4 max-w-lg text-lg leading-8 text-ink-2">
            The link may be out of date. You can go back to the home page or start a translation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/" variant="secondary" leading={<ArrowLeft aria-hidden />}>
              Back to home
            </ButtonLink>
            <ButtonLink to="/app/speech-to-sign">Open the translator</ButtonLink>
          </div>
        </div>
        <div className="relative flex h-44 w-52 shrink-0 items-end justify-center md:h-64 md:w-72" aria-hidden>
          <span className="absolute bottom-0 h-36 w-48 rounded-full bg-sky-200 md:h-52 md:w-72" />
          <Pal pose="wave" outfit="mint" skin="deep" hair="bun" animate className="relative h-40 md:h-56" />
        </div>
      </main>
    </div>
  );
}
