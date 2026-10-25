import { z } from "zod";

const count = z.number().int().min(0).max(999);

const teamFields = z.object({
  name: z.string().trim().min(2, "Write the team name.").max(40),
  short: z
    .string()
    .trim()
    .min(2, "Use 2 or 3 letters for the badge.")
    .max(3, "Use 2 or 3 letters for the badge.")
    .transform((value) => value.toUpperCase()),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Pick a badge colour.").optional(),
  // No defaults: an update that omits a field must not reset it.
  played: count.optional(),
  won: count.optional(),
  lost: count.optional(),
  points: count.optional(),
});

export const createTeamDto = teamFields;
export const updateTeamDto = teamFields.partial();

export type CreateTeamInput = z.infer<typeof createTeamDto>;
export type UpdateTeamInput = z.infer<typeof updateTeamDto>;
