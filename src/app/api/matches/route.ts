import { ok, parseBody, serviceFailure } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { revalidateSite } from "@/lib/cache";
import { createMatchDto } from "@/modules/matches/match.dto";
import {
  createMatch,
  listMatchesForAdmin,
  type MatchTabFilter,
} from "@/modules/matches/match.service";

// GET /api/matches?q=&tab=all|upcoming|results
export const GET = withAdmin(async (req) => {
  const params = req.nextUrl.searchParams;
  const tab = params.get("tab");
  const matches = await listMatchesForAdmin({
    query: params.get("q") ?? undefined,
    tab: (["upcoming", "results"].includes(tab ?? "") ? tab : "all") as MatchTabFilter,
  });
  return ok({ matches });
});

export const POST = withAdmin(async (req) => {
  const parsed = await parseBody(req, createMatchDto);
  if (parsed.response) return parsed.response;

  const result = await createMatch(parsed.data);
  if (!result.ok) return serviceFailure(result);

  revalidateSite();
  return ok({ match: result.match }, { status: 201 });
});
