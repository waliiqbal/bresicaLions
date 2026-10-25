import { z } from "zod";

const objectId = z.string().length(24, "Choose a team.");

// Scores like "112/4" or "87/9 (10 ov)".
const score = z.string().trim().max(20);

const matchFields = z.object({
  homeTeamId: objectId,
  awayTeamId: objectId,
  /** ISO date; the admin form converts the Italian time the admin typed. */
  date: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Choose the match date and time."),
  ground: z.string().trim().min(2, "Write the ground.").max(80),
  status: z.enum(["upcoming", "completed"]),
  homeScore: score.optional(),
  awayScore: score.optional(),
  result: z.enum(["won", "lost", "tie", "no-result"]).nullable().optional(),
});

export const createMatchDto = matchFields;
export const updateMatchDto = matchFields.partial();

export type CreateMatchInput = z.infer<typeof createMatchDto>;
export type UpdateMatchInput = z.infer<typeof updateMatchDto>;
