import { ok, parseBody, serviceFailure } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { revalidateSite } from "@/lib/cache";
import { createTeamDto } from "@/modules/teams/team.dto";
import { createTeam, listTeamsForAdmin } from "@/modules/teams/team.service";

// Teams and their points-table rows.
export const GET = withAdmin(async () => {
  return ok({ teams: await listTeamsForAdmin() });
});

export const POST = withAdmin(async (req) => {
  const parsed = await parseBody(req, createTeamDto);
  if (parsed.response) return parsed.response;

  const result = await createTeam(parsed.data);
  if (!result.ok) return serviceFailure(result);

  revalidateSite();
  return ok({ team: result.team }, { status: 201 });
});
