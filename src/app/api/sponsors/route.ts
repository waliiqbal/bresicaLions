import { ok, parseBody } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { revalidateSite } from "@/lib/cache";
import { createSponsorDto } from "@/modules/sponsors/sponsor.dto";
import {
  createSponsor,
  listSponsorsForAdmin,
} from "@/modules/sponsors/sponsor.service";

// GET /api/sponsors?q=
export const GET = withAdmin(async (req) => {
  const sponsors = await listSponsorsForAdmin(req.nextUrl.searchParams.get("q") ?? undefined);
  return ok({ sponsors });
});

export const POST = withAdmin(async (req) => {
  const parsed = await parseBody(req, createSponsorDto);
  if (parsed.response) return parsed.response;

  const sponsor = await createSponsor(parsed.data);
  revalidateSite();
  return ok({ sponsor }, { status: 201 });
});
