import { apiError, ok, parseBody, serviceFailure } from "@/lib/api";
import { withAdmin } from "@/lib/auth";
import { revalidateSite } from "@/lib/cache";
import { updateStaffDto } from "@/modules/staff/staff.dto";
import {
  deleteStaff,
  getStaffForAdmin,
  updateStaff,
} from "@/modules/staff/staff.service";

type Ctx = RouteContext<"/api/staff/[id]">;

export const GET = withAdmin<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  const staff = await getStaffForAdmin(id);
  return staff ? ok({ staff }) : apiError("not_found", "Staff member not found.", 404);
});

export const PATCH = withAdmin<Ctx>(async (req, { params }) => {
  const { id } = await params;
  const parsed = await parseBody(req, updateStaffDto);
  if (parsed.response) return parsed.response;

  const result = await updateStaff(id, parsed.data);
  if (!result.ok) return serviceFailure(result);

  revalidateSite();
  return ok({ staff: result.staff });
});

export const DELETE = withAdmin<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  if (!(await deleteStaff(id))) {
    return apiError("not_found", "Staff member not found.", 404);
  }
  revalidateSite();
  return ok();
});
