import { apiError, ok, parseBody, serviceFailure } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { revalidateSite } from "@/lib/cache";
import { updateMatchDto } from "@/modules/matches/match.dto";
import {
  deleteMatch,
  getMatchForAdmin,
  updateMatch,
} from "@/modules/matches/match.service";

type Ctx = RouteContext<"/api/matches/[id]">;

export const GET = withAdmin<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  const match = await getMatchForAdmin(id);
  return match ? ok({ match }) : apiError("not_found", "Match not found.", 404);
});

export const PATCH = withAdmin<Ctx>(async (req, { params }) => {
  const { id } = await params;
  const parsed = await parseBody(req, updateMatchDto);
  if (parsed.response) return parsed.response;

  const result = await updateMatch(id, parsed.data);
  if (!result.ok) return serviceFailure(result);

  revalidateSite();
  return ok({ match: result.match });
});

export const DELETE = withAdmin<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  if (!(await deleteMatch(id))) {
    return apiError("not_found", "Match not found.", 404);
  }
  revalidateSite();
  return ok();
});
