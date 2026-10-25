import { z } from "zod";

export const createMessageDto = z.object({
  name: z.string().trim().min(2, "Please write your name.").max(80),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address.").max(254)),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least a few words.")
    .max(2000, "Please keep the message under 2000 characters."),
  // Hidden field a real visitor never fills in; bots do.
  website: z.string().max(200).optional(),
});

export const updateMessageDto = z.object({ read: z.boolean() });

export type CreateMessageInput = z.infer<typeof createMessageDto>;
