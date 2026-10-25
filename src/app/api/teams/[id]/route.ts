import { ok, parseBody, serviceFailure } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { revalidateSite } from "@/lib/cache";
import { updateTeamDto } from "@/modules/teams/team.dto";
import { deleteTeam, updateTeam } from "@/modules/teams/team.service";

type Ctx = RouteContext<"/api/teams/[id]">;

export const PATCH = withAdmin<Ctx>(async (req, { params }) => {
  const { id } = await params;
  const parsed = await parseBody(req, updateTeamDto);
  if (parsed.response) return parsed.response;

  const result = await updateTeam(id, parsed.data);
  if (!result.ok) return serviceFailure(result);

  revalidateSite();
  return ok({ team: result.team });
});

export const DELETE = withAdmin<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  const result = await deleteTeam(id);
  if (!result.ok) return serviceFailure(result);

  revalidateSite();
  return ok();
});
