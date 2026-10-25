import { z } from "zod";
import { imageDto } from "@/lib/images";

const staffFields = z.object({
  name: z.string().trim().min(2, "Write the name.").max(60),
  role: z.string().trim().min(2, "Write the role, for example Head Coach.").max(60),
  bio: z.string().trim().max(240).optional(),
  profile: z.string().trim().max(3000).optional(),
  experience: z.string().trim().max(40).optional(),
  speciality: z.string().trim().max(60).optional(),
  image: imageDto.nullable().optional(),
});

export const createStaffDto = staffFields;
// No defaults here: an update that omits a field must not reset it.
export const updateStaffDto = staffFields.partial();
export const reorderStaffDto = z.object({
  ids: z.array(z.string().length(24)).min(1).max(100),
});

export type CreateStaffInput = z.infer<typeof createStaffDto>;
export type UpdateStaffInput = z.infer<typeof updateStaffDto>;
