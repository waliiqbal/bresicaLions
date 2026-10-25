import { ok, parseBody } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { revalidateSite } from "@/lib/cache";
import { updateSettingsDto } from "@/modules/settings/settings.dto";
import {
  getSettingsForAdmin,
  updateSettings,
} from "@/modules/settings/settings.service";

export const GET = withAdmin(async () => {
  return ok({ settings: await getSettingsForAdmin() });
});

// PATCH changes only the fields that are sent.
export const PATCH = withAdmin(async (req) => {
  const parsed = await parseBody(req, updateSettingsDto);
  if (parsed.response) return parsed.response;

  const settings = await updateSettings(parsed.data);
  revalidateSite();
  return ok({ settings });
});
