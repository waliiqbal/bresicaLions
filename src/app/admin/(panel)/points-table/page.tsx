import type { Metadata } from "next";
import { TeamManager } from "@/components/admin/TeamManager";
import { AdminHeader } from "@/components/admin/ui";
import { listTeamsForAdmin } from "@/modules/teams/team.service";

export const metadata: Metadata = { title: "Points table" };

export default async function PointsTableAdminPage() {
  const teams = await listTeamsForAdmin();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminHeader
        eyebrow="League"
        title="Points table"
        description="The teams of the league and their numbers. The website sorts the table by points, then wins. Update a row after every match (a win is usually 2 points)."
      />
      <TeamManager teams={teams} />
    </div>
  );
}
