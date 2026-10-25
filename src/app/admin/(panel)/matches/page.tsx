import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminHeader, EmptyState, Notice, StatusPill } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { cn, formatMatchDate } from "@/lib/utils";
import {
  listMatchesForAdmin,
  needsResult,
  type MatchTabFilter,
} from "@/modules/matches/match.service";
import type { MatchResult } from "@/modules/matches/match.types";

export const metadata: Metadata = { title: "Matches & results" };

const notices: Record<string, string> = {
  created: "Match added.",
  updated: "Match updated.",
};

const tabs: { id: MatchTabFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "results", label: "Results" },
];

const resultLabel: Record<MatchResult, { text: string; tone: "green" | "gold" | "gray" }> = {
  won: { text: "Won", tone: "green" },
  lost: { text: "Lost", tone: "gold" },
  tie: { text: "Tie", tone: "gray" },
  "no-result": { text: "No result", tone: "gray" },
};

export default async function MatchesAdminPage({
  searchParams,
}: PageProps<"/admin/matches">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const tab = (
    ["upcoming", "results"].includes(String(params.tab)) ? params.tab : "all"
  ) as MatchTabFilter;
  const notice = typeof params.notice === "string" ? notices[params.notice] : undefined;

  const matches = await listMatchesForAdmin({ tab, query: q });

  const tabHref = (t: MatchTabFilter) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (t !== "all") search.set("tab", t);
    const qs = search.toString();
    return qs ? `/admin/matches?${qs}` : "/admin/matches";
  };

  return (
    <div className="mx-auto max-w-6xl">
      <AdminHeader
        eyebrow="Fixtures"
        title="Matches & results"
        description="Add the schedule, then open a match after it is played to enter the score and result."
        action={
          <ButtonLink href="/admin/matches/new" variant="dark">
            + Add match
          </ButtonLink>
        }
      />

      {notice && <Notice>{notice}</Notice>}

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Filter matches" className="flex gap-2">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={tabHref(t.id)}
              aria-current={tab === t.id ? "true" : undefined}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider",
                tab === t.id
                  ? "border-green-dark bg-green-dark text-cream"
                  : "border-green-dark/30 text-green-dark hover:bg-green-dark/10",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <form action="/admin/matches" role="search" className="flex gap-2">
          {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search team or ground..."
            aria-label="Search matches"
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

      {matches.length === 0 ? (
        <EmptyState
          title={q || tab !== "all" ? "No matches found" : "No matches yet"}
          text={
            q || tab !== "all"
              ? "Try a different search or filter."
              : "Until you add matches, the website shows “Fixtures Coming Soon”. Add the other teams in the Points Table first."
          }
          href="/admin/matches/new"
          actionLabel="Add match"
        />
      ) : (
        <ul className="space-y-3">
          {matches.map((match) => {
            const completed = match.status === "completed";
            const overdue = needsResult(match);
            return (
              <li
                key={match.id}
                className="flex flex-col gap-4 rounded-xl border border-green-dark/15 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">
                    {match.home.name} <span className="text-ink/50">vs</span> {match.away.name}
                    {completed && (
                      <span className="ml-3 font-heading text-green-card">
                        {match.homeScore} – {match.awayScore}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-ink/55">
                    {formatMatchDate(match.date)} · {match.ground}
                  </p>
                </div>
                {completed && match.result ? (
                  <StatusPill tone={resultLabel[match.result].tone}>{resultLabel[match.result].text}</StatusPill>
                ) : overdue ? (
                  <StatusPill tone="gold">Add result</StatusPill>
                ) : (
                  <StatusPill tone={completed ? "gray" : "green"}>{completed ? "Finished" : "Upcoming"}</StatusPill>
                )}
                <div className="flex gap-2">
                  <ButtonLink href={`/admin/matches/${match.id}`} variant="outlineDark" className="px-4 py-2">
                    {overdue ? "Add result" : "Edit"}
                  </ButtonLink>
                  <DeleteButton
                    endpoint={`/api/matches/${match.id}`}
                    itemName="this match"
                    message={`${match.home.name} vs ${match.away.name} will be removed from the website.`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
