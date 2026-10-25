import type { Metadata } from "next";
import { FixturesView } from "@/components/site/FixturesView";
import {
  getAllMatches,
  getUpcomingMatches,
} from "@/modules/matches/match.service";
import { getStandings } from "@/modules/teams/team.service";

export const metadata: Metadata = {
  title: "Fixtures",
  description:
    "Upcoming matches, results and the league table for the Brescia Lions.",
};

export default async function FixturesPage({
  searchParams,
}: PageProps<"/fixtures">) {
  const { tab } = await searchParams;
  const upcomingOnly = tab === "upcoming";

  const [matches, standings] = await Promise.all([
    upcomingOnly ? getUpcomingMatches() : getAllMatches(),
    getStandings(),
  ]);

  return (
    <FixturesView
      tab={upcomingOnly ? "upcoming" : "all"}
      matches={matches}
      standings={standings}
    />
  );
}
