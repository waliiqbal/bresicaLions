import type { Metadata } from "next";
import { FixturesView } from "@/components/site/FixturesView";
import { getResults } from "@/modules/matches/match.service";
import { getStandings } from "@/modules/teams/team.service";

export const metadata: Metadata = {
  title: "Results",
  description: "Match results and the league table for the Brescia Lions.",
};

export default async function ResultsPage() {
  const [matches, standings] = await Promise.all([
    getResults(),
    getStandings(),
  ]);

  return <FixturesView tab="results" matches={matches} standings={standings} />;
}
