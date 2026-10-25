import { z } from "zod";
import { imageDto } from "@/lib/images";

const sponsorFields = z.object({
  name: z.string().trim().min(2, "Write the sponsor name.").max(60),
  // Empty means no link. Only full https:// addresses are accepted.
  url: z
    .string()
    .trim()
    .max(300)
    .refine((value) => value === "" || /^https:\/\//.test(value), "Use a full link starting with https://")
    .optional(),
  logo: imageDto.nullable().optional(),
  // No defaults here: an update that omits `active` must not reset it.
  active: z.boolean().optional(),
});

export const createSponsorDto = sponsorFields;
export const updateSponsorDto = sponsorFields.partial();
export const reorderSponsorsDto = z.object({
  ids: z.array(z.string().length(24)).min(1).max(100),
});

export type CreateSponsorInput = z.infer<typeof createSponsorDto>;
export type UpdateSponsorInput = z.infer<typeof updateSponsorDto>;
