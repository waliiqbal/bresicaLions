"use client";

import { Button, ButtonLink } from "@/components/ui/Button";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <section role="alert" className="mx-auto max-w-xl py-20 text-center">
      <p className="font-heading text-3xl font-bold text-green-dark">Something went wrong</p>
      <p className="mt-2 text-ink/70">
        This page could not be loaded. Check your internet connection and try again. If it keeps
        happening, the database or a service may be unavailable.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="dark" onClick={reset}>
          Try again
        </Button>
        <ButtonLink href="/admin" variant="outlineDark">
          Dashboard
        </ButtonLink>
      </div>
    </section>
  );
}
