import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MatchForm } from "@/components/admin/MatchForm";
import { AdminHeader } from "@/components/admin/ui";
import { getMatchForAdmin } from "@/modules/matches/match.service";
import { listTeamsForAdmin } from "@/modules/teams/team.service";

export const metadata: Metadata = { title: "Edit match" };

export default async function EditMatchPage({
  params,
}: PageProps<"/admin/matches/[id]">) {
  const { id } = await params;
  const [match, teams] = await Promise.all([getMatchForAdmin(id), listTeamsForAdmin()]);
  if (!match) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminHeader eyebrow="Matches" title="Edit match" />
      <MatchForm teams={teams} match={match} />
    </div>
  );
}
