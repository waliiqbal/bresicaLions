"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./LogoutButton";

// `ready` flips to true as each section is built in the next phases.
const items = [
  { label: "Dashboard", href: "/admin", ready: true },
  { label: "Main Banner", href: "/admin/banners", ready: true },
  { label: "News", href: "/admin/news", ready: true },
  { label: "Matches & Results", href: "/admin/matches", ready: true },
  { label: "Points Table", href: "/admin/points-table", ready: true },
  { label: "Squad", href: "/admin/squad", ready: true },
  { label: "Gallery", href: "/admin/gallery", ready: true },
  { label: "Sponsors", href: "/admin/sponsors", ready: true },
  { label: "About Us", href: "/admin/about", ready: true },
  { label: "Messages", href: "/admin/messages", ready: true },
  { label: "Subscribers", href: "/admin/subscribers", ready: true },
  { label: "Settings", href: "/admin/settings", ready: true },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const nav = (
    <nav aria-label="Admin sections" className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            {item.ready ? (
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
                  isActive(item.href)
                    ? "bg-gold text-green-deep"
                    : "text-cream/85 hover:bg-white/10",
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold text-cream/35"
              >
                {item.label}
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider">
                  Soon
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );

  const footer = (
    <div className="space-y-3 border-t border-white/10 p-4">
      <p className="truncate text-xs text-cream/60" title={email}>
        {email}
      </p>
      <LogoutButton />
      <Link
        href="/"
        target="_blank"
        className="block text-center text-xs text-cream/60 hover:text-gold-light"
      >
        View website ↗
      </Link>
    </div>
  );

  return (
    <>
      {/* Phone and tablet: top bar + slide-in drawer */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-green-dark px-4 py-3 text-cream lg:hidden">
        <Link href="/admin" className="flex items-center gap-3">
          <Logo size={36} />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
            Admin
          </span>
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded p-2 text-2xl leading-none text-gold-light"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-green-dark pt-16 text-cream shadow-2xl">
            {nav}
            {footer}
          </aside>
        </div>
      )}

      {/* Desktop: fixed sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-green-dark text-cream lg:flex">
        <Link
          href="/admin"
          className="flex flex-col items-center gap-1.5 border-b border-white/10 px-4 py-4"
        >
          <Logo size={56} />
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">
            Admin Panel
          </span>
        </Link>
        {nav}
        {footer}
      </aside>
    </>
  );
}
