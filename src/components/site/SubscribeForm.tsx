"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { sendJson } from "@/lib/client-api";

// Posts to /api/subscribers: the email is saved in the admin panel.
export function SubscribeForm() {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus(null);
    setSending(true);

    const result = await sendJson("/api/subscribers", {
      email: data.get("email"),
      website: data.get("website"),
    });
    setSending(false);

    if (!result.ok) {
      setStatus({ ok: false, text: result.message });
      return;
    }
    form.reset();
    setStatus({ ok: true, text: "Thank you! You are subscribed." });
  }

  return (
    <div className="w-full max-w-sm">
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex w-full overflow-hidden rounded-full border border-gold/30 bg-green-dark"
      >
        {/* Bot trap: hidden from people, bots fill it in. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          placeholder="Your email"
          aria-label="Your email"
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-cream placeholder:text-cream/40 focus:outline-none"
        />
        <Button type="submit" disabled={sending} className="rounded-none">
          {sending ? "..." : "Subscribe"}
        </Button>
      </form>
      <p className="mt-2 text-[11px] leading-snug text-cream/50">
        By subscribing you agree to receive club news. See our{" "}
        <Link href="/privacy" className="underline hover:text-gold-light">
          Privacy Policy
        </Link>
        .
      </p>
      {status && (
        <p
          role={status.ok ? "status" : "alert"}
          className={`mt-2 text-xs ${status.ok ? "text-gold-light" : "text-flag-red-soft"}`}
        >
          {status.text}
        </p>
      )}
    </div>
  );
}
