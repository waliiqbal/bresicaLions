import { ok, parseBody } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { revalidateSite } from "@/lib/cache";
import { reorderStaffDto } from "@/modules/staff/staff.dto";
import { reorderStaff } from "@/modules/staff/staff.service";

// POST { ids: [...] } with the staff ids in their new order.
export const POST = withAdmin(async (req) => {
  const parsed = await parseBody(req, reorderStaffDto);
  if (parsed.response) return parsed.response;

  await reorderStaff(parsed.data.ids);
  revalidateSite();
  return ok();
});
