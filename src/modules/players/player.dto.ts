import { z } from "zod";
import { imageDto } from "@/lib/images";
import { PLAYER_ROLES } from "./player.types";

const playerFields = z.object({
  name: z.string().trim().min(2, "Write the player's name.").max(60),
  number: z.number().int().min(0, "Shirt number must be 0 or more.").max(999),
  role: z.enum(PLAYER_ROLES),
  isCaptain: z.boolean().optional(),
  battingStyle: z.string().trim().max(60).optional(),
  bowlingStyle: z.string().trim().max(60).optional(),
  bio: z.string().trim().max(2000).optional(),
  image: imageDto.nullable().optional(),
});

export const createPlayerDto = playerFields;
// No defaults here: an update that omits a field must not reset it.
export const updatePlayerDto = playerFields.partial();

export type CreatePlayerInput = z.infer<typeof createPlayerDto>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerDto>;
