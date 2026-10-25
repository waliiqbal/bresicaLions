import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FilterChips } from "@/components/site/FilterChips";
import { PageHeader } from "@/components/site/PageHeader";
import { PlayerCard } from "@/components/site/PlayerCard";
import { Section } from "@/components/site/Section";
import { ScrollRow } from "@/components/site/ScrollRow";
import { StaffCard } from "@/components/site/StaffCard";
import { getPlayers, isPlayerRole } from "@/modules/players/player.service";
import { PLAYER_ROLES } from "@/modules/players/player.types";
import { getSupportStaff } from "@/modules/staff/staff.service";

export const metadata: Metadata = {
  title: "Squad",
  description:
    "Meet the Brescia Lions squad: players, captain, coaches and support staff.",
};

export default async function SquadPage({ searchParams }: PageProps<"/squad">) {
  const params = await searchParams;
  const rawRole = typeof params.role === "string" ? params.role : "";
  const role = isPlayerRole(rawRole) ? rawRole : undefined;

  const [players, staff] = await Promise.all([
    getPlayers(role),
    getSupportStaff(),
  ]);

  const chips = [
    { label: "All", href: "/squad", active: !role },
    ...PLAYER_ROLES.map((r) => ({
      label: r,
      href: `/squad?role=${encodeURIComponent(r)}`,
      active: r === role,
    })),
  ];

  return (
    <>
      <PageHeader
        eyebrow="The pride of Brescia"
        white="Our"
        gold="Squad"
        subtitle="The players and staff who wear the crest. Pick a player to see their profile."
      />

      <Section>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <FilterChips label="Filter players by role" items={chips} />
          <p className="text-sm text-cream/60">
            {players.length} {players.length === 1 ? "player" : "players"}
          </p>
        </div>

        {players.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {players.map((player, i) => (
              <li key={player.id}>
                <PlayerCard player={player} priority={i < 4} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-gold/25 bg-green-dark/60 px-6 py-14 text-center text-cream/70">
            {role
              ? "No players found for this role."
              : "The squad will be announced soon."}
          </p>
        )}
      </Section>

      {!role && staff.length > 0 && (
        <Section className="bg-black/20">
          <SectionHeading
            white="Support"
            gold="Staff"
            subtitle="Coaches and staff behind the squad"
          />
          <ScrollRow scrollbar flush gap="gap-4 sm:gap-5">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex w-[calc(50%-0.5rem)] shrink-0 snap-start sm:w-[calc(50%-0.625rem)] md:w-[calc(33.333%-0.8333rem)] lg:w-[calc(25%-0.9375rem)]"
              >
                <div className="w-full">
                  <StaffCard
                    member={member}
                    href={`/squad/staff/${member.slug}`}
                  />
                </div>
              </div>
            ))}
          </ScrollRow>
        </Section>
      )}
    </>
  );
}
