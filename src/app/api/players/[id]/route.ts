import { apiError, ok, parseBody, serviceFailure } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { revalidateSite } from "@/lib/cache";
import { updatePlayerDto } from "@/modules/players/player.dto";
import {
  deletePlayer,
  getPlayerForAdmin,
  updatePlayer,
} from "@/modules/players/player.service";

type Ctx = RouteContext<"/api/players/[id]">;

export const GET = withAdmin<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  const player = await getPlayerForAdmin(id);
  return player ? ok({ player }) : apiError("not_found", "Player not found.", 404);
});

export const PATCH = withAdmin<Ctx>(async (req, { params }) => {
  const { id } = await params;
  const parsed = await parseBody(req, updatePlayerDto);
  if (parsed.response) return parsed.response;

  const result = await updatePlayer(id, parsed.data);
  if (!result.ok) return serviceFailure(result);

  revalidateSite();
  return ok({ player: result.player });
});

export const DELETE = withAdmin<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  if (!(await deletePlayer(id))) {
    return apiError("not_found", "Player not found.", 404);
  }
  revalidateSite();
  return ok();
});
