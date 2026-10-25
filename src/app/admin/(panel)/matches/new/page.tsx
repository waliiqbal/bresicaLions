import type { Metadata } from "next";
import { MatchForm } from "@/components/admin/MatchForm";
import { AdminHeader } from "@/components/admin/ui";
import { listTeamsForAdmin } from "@/modules/teams/team.service";

export const metadata: Metadata = { title: "Add match" };

export default async function NewMatchPage() {
  const teams = await listTeamsForAdmin();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminHeader eyebrow="Matches" title="Add match" />
      <MatchForm teams={teams} />
    </div>
  );
}
