"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Error boundary for the /shop section with retry. */
export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Shop Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="size-7 text-destructive" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-bold">Something went wrong</h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          We couldn&apos;t load the shop right now. This is usually temporary —
          please try again in a moment.
        </p>
      </div>

      <Button
        onClick={reset}
        size="lg"
        className="rounded-xl"
      >
        <RefreshCw className="mr-2 size-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
