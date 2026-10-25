import { ok, parseBody } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { revalidateSite } from "@/lib/cache";
import { updateAboutDto } from "@/modules/about/about.dto";
import { getAboutForAdmin, updateAbout } from "@/modules/about/about.service";

export const GET = withAdmin(async () => {
  return ok({ about: await getAboutForAdmin() });
});

// PATCH changes only the fields that are sent.
export const PATCH = withAdmin(async (req) => {
  const parsed = await parseBody(req, updateAboutDto);
  if (parsed.response) return parsed.response;

  await updateAbout(parsed.data);
  revalidateSite();
  return ok({ about: await getAboutForAdmin() });
});
