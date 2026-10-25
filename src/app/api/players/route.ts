import { ok, parseBody, serviceFailure } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { revalidateSite } from "@/lib/cache";
import { createPlayerDto } from "@/modules/players/player.dto";
import {
  createPlayer,
  isPlayerRole,
  listPlayersForAdmin,
} from "@/modules/players/player.service";

// GET /api/players?q=&role=Batter
export const GET = withAdmin(async (req) => {
  const params = req.nextUrl.searchParams;
  const role = params.get("role");
  const players = await listPlayersForAdmin({
    query: params.get("q") ?? undefined,
    role: isPlayerRole(role) ? role : undefined,
  });
  return ok({ players });
});

export const POST = withAdmin(async (req) => {
  const parsed = await parseBody(req, createPlayerDto);
  if (parsed.response) return parsed.response;

  const result = await createPlayer(parsed.data);
  if (!result.ok) return serviceFailure(result);

  revalidateSite();
  return ok({ player: result.player }, { status: 201 });
});
