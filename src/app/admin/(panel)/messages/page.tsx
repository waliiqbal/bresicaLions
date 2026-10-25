import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader, EmptyState, Notice, StatusPill } from "@/components/admin/ui";
import { cn, formatDate } from "@/lib/utils";
import {
  listMessagesForAdmin,
  type MessageFilter,
} from "@/modules/messages/message.service";

export const metadata: Metadata = { title: "Messages" };

const tabs: { id: MessageFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
];

export default async function MessagesAdminPage({
  searchParams,
}: PageProps<"/admin/messages">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const filter: MessageFilter = params.filter === "unread" ? "unread" : "all";
  const deleted = params.notice === "deleted";

  const messages = await listMessagesForAdmin({ query: q, filter });

  const tabHref = (f: MessageFilter) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (f !== "all") search.set("filter", f);
    const qs = search.toString();
    return qs ? `/admin/messages?${qs}` : "/admin/messages";
  };

  return (
    <div className="mx-auto max-w-5xl">
      <AdminHeader
        eyebrow="Inbox"
        title="Messages"
        description="Messages sent from the Contact page. Each one is also emailed to the club address in Settings."
        action={
          <Link href="/admin/subscribers" className="text-sm font-semibold text-green-card hover:underline">
            Newsletter subscribers →
          </Link>
        }
      />

      {deleted && <Notice>Message deleted.</Notice>}

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Filter messages" className="flex gap-2">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={tabHref(t.id)}
              aria-current={filter === t.id ? "true" : undefined}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider",
                filter === t.id
                  ? "border-green-dark bg-green-dark text-cream"
                  : "border-green-dark/30 text-green-dark hover:bg-green-dark/10",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <form action="/admin/messages" role="search" className="flex gap-2">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search messages..."
            aria-label="Search messages"
            className="w-full rounded-lg border border-green-dark/25 bg-white px-3.5 py-2 text-sm sm:w-64"
          />
          <button
            type="submit"
            className="rounded-lg bg-green-dark px-4 text-xs font-bold uppercase tracking-wider text-cream"
          >
            Search
          </button>
        </form>
      </div>

      {messages.length === 0 ? (
        <EmptyState
          title={q || filter !== "all" ? "No messages found" : "No messages yet"}
          text={
            q || filter !== "all"
              ? "Try a different search or filter."
              : "When someone writes to you from the Contact page, the message appears here."
          }
        />
      ) : (
        <ul className="space-y-3">
          {messages.map((message) => (
            <li key={message.id}>
              <Link
                href={`/admin/messages/${message.id}`}
                className={cn(
                  "flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-4",
                  message.read ? "border-green-dark/15" : "border-gold border-l-4",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-ink", !message.read && "font-bold")}>
                    {message.name}{" "}
                    <span className="font-normal text-ink/55">&lt;{message.email}&gt;</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink/65">{message.message}</p>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                  {!message.read && <StatusPill tone="gold">New</StatusPill>}
                  <span className="text-xs text-ink/55">{formatDate(message.createdAt)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
