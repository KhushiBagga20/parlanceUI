import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Pal } from "@/components/brand/Pal";

export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Something went wrong.";
  return (
    <main id="main" className="container-page flex min-h-screen flex-col items-center justify-center bg-canvas py-16 text-center">
      <div className="relative flex h-36 w-44 items-end justify-center" aria-hidden>
        <span className="absolute bottom-0 h-28 w-40 rounded-full bg-coral-100" />
        <Pal pose="rest" outfit="coral" skin="medium" hair="curly" className="relative h-32" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-[-0.035em]">This page hit a problem</h1>
      <p className="mt-2 max-w-md text-ink-3">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={() => window.location.reload()} leading={<RefreshCw aria-hidden />}>
          Reload
        </Button>
        <ButtonLink to="/" variant="secondary">
          Go to home
        </ButtonLink>
      </div>
    </main>
  );
}
