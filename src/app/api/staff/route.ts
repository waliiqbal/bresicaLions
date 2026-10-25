import { ok, parseBody, serviceFailure } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { revalidateSite } from "@/lib/cache";
import { createStaffDto } from "@/modules/staff/staff.dto";
import { createStaff, listStaffForAdmin } from "@/modules/staff/staff.service";

// GET /api/staff?q=
export const GET = withAdmin(async (req) => {
  const staff = await listStaffForAdmin(req.nextUrl.searchParams.get("q") ?? undefined);
  return ok({ staff });
});

export const POST = withAdmin(async (req) => {
  const parsed = await parseBody(req, createStaffDto);
  if (parsed.response) return parsed.response;

  const result = await createStaff(parsed.data);
  if (!result.ok) return serviceFailure(result);

  revalidateSite();
  return ok({ staff: result.staff }, { status: 201 });
});
