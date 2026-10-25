import { apiError, ok, parseBody } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { revalidateSite } from "@/lib/cache";
import { updateSponsorDto } from "@/modules/sponsors/sponsor.dto";
import {
  deleteSponsor,
  getSponsorForAdmin,
  updateSponsor,
} from "@/modules/sponsors/sponsor.service";

type Ctx = RouteContext<"/api/sponsors/[id]">;

export const GET = withAdmin<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  const sponsor = await getSponsorForAdmin(id);
  return sponsor ? ok({ sponsor }) : apiError("not_found", "Sponsor not found.", 404);
});

export const PATCH = withAdmin<Ctx>(async (req, { params }) => {
  const { id } = await params;
  const parsed = await parseBody(req, updateSponsorDto);
  if (parsed.response) return parsed.response;

  const sponsor = await updateSponsor(id, parsed.data);
  if (!sponsor) return apiError("not_found", "Sponsor not found.", 404);

  revalidateSite();
  return ok({ sponsor });
});

export const DELETE = withAdmin<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  if (!(await deleteSponsor(id))) {
    return apiError("not_found", "Sponsor not found.", 404);
  }
  revalidateSite();
  return ok();
});
