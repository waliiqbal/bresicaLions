import { z } from "zod";

// Empty hides the link. Only full https:// addresses are accepted.
const socialLink = z
  .string()
  .trim()
  .max(300)
  .refine((value) => value === "" || /^https:\/\//.test(value), "Use a full link starting with https://");

const settingsFields = z.object({
  email: z.email("Write a valid email address.").max(120),
  phone: z.string().trim().max(40),
  address: z.string().trim().min(3, "Write the club address.").max(200),
  socials: z
    .object({
      instagram: socialLink,
      facebook: socialLink,
      x: socialLink,
      youtube: socialLink,
      tiktok: socialLink,
    })
    .partial(),
  footerText: z.string().trim().min(1, "Write a short footer line.").max(160),
});

// Only the fields that are sent are changed.
export const updateSettingsDto = settingsFields.partial();

export type UpdateSettingsInput = z.infer<typeof updateSettingsDto>;
