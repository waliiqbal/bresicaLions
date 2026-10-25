import { ok, parseBody } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { revalidateSite } from "@/lib/cache";
import { reorderSponsorsDto } from "@/modules/sponsors/sponsor.dto";
import { reorderSponsors } from "@/modules/sponsors/sponsor.service";

// POST { ids: [...] } with the sponsor ids in their new order.
export const POST = withAdmin(async (req) => {
  const parsed = await parseBody(req, reorderSponsorsDto);
  if (parsed.response) return parsed.response;

  await reorderSponsors(parsed.data.ids);
  revalidateSite();
  return ok();
});
