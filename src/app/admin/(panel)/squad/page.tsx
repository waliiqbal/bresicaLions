import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { OrderedList } from "@/components/admin/OrderedList";
import { AdminHeader, EmptyState, Notice, StatusPill } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { isPlayerRole, listPlayersForAdmin } from "@/modules/players/player.service";
import { PLAYER_ROLES } from "@/modules/players/player.types";
import { listStaffForAdmin } from "@/modules/staff/staff.service";

export const metadata: Metadata = { title: "Squad" };

const notices: Record<string, string> = {
  "player-created": "Player added to the squad.",
  "player-updated": "Player updated.",
  "staff-created": "Staff member added.",
  "staff-updated": "Staff member updated.",
};

export default async function SquadAdminPage({
  searchParams,
}: PageProps<"/admin/squad">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const roleParam = typeof params.role === "string" ? params.role : "";
  const role = isPlayerRole(roleParam) ? roleParam : undefined;
  const notice = typeof params.notice === "string" ? notices[params.notice] : undefined;

  const [players, staff] = await Promise.all([
    listPlayersForAdmin({ query: q, role }),
    listStaffForAdmin(q),
  ]);
  const filtering = Boolean(q || role);

  const roleHref = (r?: string) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (r) search.set("role", r);
    const qs = search.toString();
    return qs ? `/admin/squad?${qs}` : "/admin/squad";
  };

  return (
    <div className="mx-auto max-w-6xl">
      <AdminHeader
        eyebrow="Squad"
        title="Players & staff"
        description="The players of the squad and the coaching staff. Each one gets a profile page on the website."
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin/squad/new" variant="dark">
              + Add player
            </ButtonLink>
            <ButtonLink href="/admin/squad/staff/new" variant="outlineDark">
              + Add staff
            </ButtonLink>
          </div>
        }
      />

      {notice && <Notice>{notice}</Notice>}

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter players by role" className="flex flex-wrap gap-2">
          {[undefined, ...PLAYER_ROLES].map((r) => (
            <Link
              key={r ?? "all"}
              href={roleHref(r)}
              aria-current={role === r ? "true" : undefined}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider",
                role === r
                  ? "border-green-dark bg-green-dark text-cream"
                  : "border-green-dark/30 text-green-dark hover:bg-green-dark/10",
              )}
            >
              {r ?? "All"}
            </Link>
          ))}
        </nav>
        <form action="/admin/squad" role="search" className="flex gap-2">
          {role && <input type="hidden" name="role" value={role} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name..."
            aria-label="Search the squad"
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

      <h2 className="mb-3 font-heading text-xl font-bold text-green-dark">
        Players <span className="text-base text-ink/50">({players.length})</span>
      </h2>
      {players.length === 0 ? (
        <EmptyState
          title={filtering ? "No players found" : "No players yet"}
          text={
            filtering
              ? "Try a different search or role."
              : "Add the first player. You can also load demo content from the Dashboard."
          }
          href="/admin/squad/new"
          actionLabel="Add player"
        />
      ) : (
        <ul className="space-y-3">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex flex-col gap-4 rounded-xl border border-green-dark/15 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-paper">
                {player.image && (
                  <Image src={player.image} alt="" fill sizes="64px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">
                  <span className="mr-2 font-heading text-green-card">#{player.number}</span>
                  {player.name}
                </p>
                <p className="mt-1 text-xs text-ink/55">
                  {player.role}
                  {player.isDemo && " · Demo"}
                </p>
              </div>
              {player.isCaptain && <StatusPill tone="gold">Captain</StatusPill>}
              <div className="flex gap-2">
                <ButtonLink href={`/admin/squad/${player.id}`} variant="outlineDark" className="px-4 py-2">
                  Edit
                </ButtonLink>
                <DeleteButton
                  endpoint={`/api/players/${player.id}`}
                  itemName="this player"
                  message={`${player.name} will be removed from the squad and the website, and the photo deleted.`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {!role && (
        <>
          <h2 className="mb-1 mt-12 font-heading text-xl font-bold text-green-dark">
            Coaching & support staff <span className="text-base text-ink/50">({staff.length})</span>
          </h2>
          <p className="mb-3 text-sm text-ink/60">
            Shown under the squad and on the About Us page, in this order.
          </p>
          {staff.length === 0 ? (
            <EmptyState
              title={q ? "No staff found" : "No staff yet"}
              text={q ? "Try a different search." : "Add the head coach and the rest of the support team."}
              href="/admin/squad/staff/new"
              actionLabel="Add staff"
            />
          ) : (
            <OrderedList
              items={staff.map((member) => ({
                id: member.id,
                title: member.name,
                subtitle: member.role,
                image: member.image,
                isDemo: member.isDemo,
              }))}
              apiPath="/api/staff"
              editPath="/admin/squad/staff"
              itemName="this staff member"
              deleteMessage="{name} will be removed from the website and the photo deleted."
              reorderDisabled={Boolean(q)}
            />
          )}
        </>
      )}
    </div>
  );
}
