"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { sendJson } from "@/lib/client-api";

const fieldClass =
  "w-full rounded-lg border border-gold/30 bg-green-deep/70 px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none";

const labelClass = "mb-2 block text-[11px] font-bold uppercase tracking-widest text-gold";

// Posts to /api/messages: the message is saved in the admin panel and emailed to the club.
export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string[]>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError("");
    setFields({});
    setSending(true);

    const result = await sendJson("/api/messages", {
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
      website: data.get("website"),
    });
    setSending(false);

    if (!result.ok) {
      setFields(result.fields ?? {});
      setError(result.message);
      return;
    }
    form.reset();
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="py-10 text-center">
        <p className="font-heading text-2xl font-bold text-gold-light">
          Thank you!
        </p>
        <p className="mt-2 text-cream/80">
          Your message has been received. We will get back to you soon.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setSent(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  const firstError = (key: string) => fields[key]?.[0];

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {error && (
        <p role="alert" className="rounded-lg border border-flag-red/60 bg-flag-red/15 px-4 py-3 text-sm text-cream">
          {error}
        </p>
      )}

      {/* Bot trap: hidden from people, bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={80}
          autoComplete="name"
          placeholder="Your name"
          aria-invalid={Boolean(firstError("name"))}
          className={fieldClass}
        />
        {firstError("name") && <p className="mt-1.5 text-xs text-flag-red-soft">{firstError("name")}</p>}
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(firstError("email"))}
          className={fieldClass}
        />
        {firstError("email") && <p className="mt-1.5 text-xs text-flag-red-soft">{firstError("email")}</p>}
      </div>
      <div>
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={2000}
          placeholder="How can we help?"
          aria-invalid={Boolean(firstError("message"))}
          className={`${fieldClass} resize-y`}
        />
        {firstError("message") && <p className="mt-1.5 text-xs text-flag-red-soft">{firstError("message")}</p>}
      </div>
      <p className="text-xs text-cream/60">
        We use your details only to answer you. See our{" "}
        <Link href="/privacy" className="underline hover:text-gold-light">
          Privacy Policy
        </Link>
        .
      </p>
      <Button type="submit" disabled={sending}>
        {sending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
