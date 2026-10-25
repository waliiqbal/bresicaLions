import { z } from "zod";

export const subscribeDto = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address.").max(254)),
  // Hidden field a real visitor never fills in; bots do.
  website: z.string().max(200).optional(),
});

export type SubscribeInput = z.infer<typeof subscribeDto>;
