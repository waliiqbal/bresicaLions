import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminHeader, EmptyState } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { listSubscribersForAdmin } from "@/modules/subscribers/subscriber.service";

export const metadata: Metadata = { title: "Subscribers" };

export default async function SubscribersAdminPage({
  searchParams,
}: PageProps<"/admin/subscribers">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const subscribers = await listSubscribersForAdmin(q);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/messages" className="mb-6 inline-block text-sm font-semibold text-green-card hover:underline">
        ← Messages
      </Link>
      <AdminHeader
        eyebrow="Newsletter"
        title="Subscribers"
        description="Emails collected by the subscribe box in the website footer."
        action={
          subscribers.length > 0 && !q ? (
            <ButtonLink href="/api/subscribers/export" variant="dark">
              Download CSV
            </ButtonLink>
          ) : undefined
        }
      />

      <form action="/admin/subscribers" role="search" className="mb-5 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search email..."
          aria-label="Search subscribers"
          className="w-full rounded-lg border border-green-dark/25 bg-white px-3.5 py-2 text-sm sm:w-64"
        />
        <button
          type="submit"
          className="rounded-lg bg-green-dark px-4 text-xs font-bold uppercase tracking-wider text-cream"
        >
          Search
        </button>
      </form>

      {subscribers.length === 0 ? (
        <EmptyState
          title={q ? "No subscribers found" : "No subscribers yet"}
          text={q ? "Try a different search." : "When visitors subscribe in the footer, their emails appear here."}
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-ink/60">
            {subscribers.length} {subscribers.length === 1 ? "subscriber" : "subscribers"}
          </p>
          <ul className="space-y-3">
            {subscribers.map((subscriber) => (
              <li
                key={subscriber.id}
                className="flex flex-col gap-3 rounded-xl border border-green-dark/15 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <p className="min-w-0 flex-1 break-all font-semibold text-ink">{subscriber.email}</p>
                <p className="text-xs text-ink/55">Joined {formatDate(subscriber.createdAt)}</p>
                <DeleteButton
                  endpoint={`/api/subscribers/${subscriber.id}`}
                  itemName="this subscriber"
                  message={`${subscriber.email} will be removed from the list.`}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
