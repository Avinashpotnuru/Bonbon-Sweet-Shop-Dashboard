import Link from "next/link";
import { Candy } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-rose-500 text-primary-foreground">
            <Candy className="size-5" aria-hidden="true" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight">Bonbon</span>
        </div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">404</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          We couldn&apos;t find the page you were looking for.
        </p>
        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
