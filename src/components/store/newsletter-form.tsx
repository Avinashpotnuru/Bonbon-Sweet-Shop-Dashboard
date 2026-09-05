"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Interactive newsletter signup for the footer. Client component so the rest of
 * the footer stays server-rendered. Shows a brief success state on submit.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    window.setTimeout(() => setSubscribed(false), 3000);
  }

  return (
    <form role="form" onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Mail
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[oklch(0.68_0.03_60)]"
          aria-hidden="true"
        />
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-label="Email address for newsletter"
          className="h-9 border-[oklch(0.9_0.03_75/0.14)] bg-white/5 pl-9 text-sm text-[oklch(0.93_0.02_85)] placeholder:text-[oklch(0.68_0.03_60)] focus-visible:ring-[oklch(0.72_0.15_75)]"
        />
      </div>
      <Button
        type="submit"
        size="icon"
        aria-live="polite"
        disabled={subscribed}
        className="shrink-0 rounded-lg bg-[oklch(0.72_0.15_75)] text-[oklch(0.2_0.04_55)] hover:bg-[oklch(0.78_0.14_74)]"
        aria-label={subscribed ? "Subscribed" : "Subscribe"}
      >
        {subscribed ? (
          <CheckCircle2 className="size-4" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
      </Button>
    </form>
  );
}