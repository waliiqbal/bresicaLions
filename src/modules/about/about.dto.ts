import { z } from "zod";
import { imageDto } from "@/lib/images";

const line = (max: number) => z.string().trim().min(1).max(max);
const lines = (max: number, count: number) => z.array(line(max)).min(1).max(count);

const statDto = z.object({
  label: z.string().trim().min(1, "Every number needs a label.").max(30),
  value: z.string().trim().min(1, "Every number needs a value.").max(20),
});

const crestElementDto = z.object({
  title: z.string().trim().min(1, "Every crest card needs a title.").max(60),
  subtitle: z.string().trim().max(120).optional(),
  text: z.string().trim().min(1, "Every crest card needs some text.").max(1200),
});

// `null` on a picture means "go back to the default picture".
const aboutFields = z.object({
  heading: z.string().trim().min(2).max(60),
  paragraphs: lines(1200, 6),
  image: imageDto.nullable(),
  stats: z.array(statDto).min(1).max(6),
  history: lines(2000, 10),
  historyClosing: lines(300, 6),
  historyImage: imageDto.nullable(),
  ownerName: z.string().trim().min(2).max(60),
  ownerKicker: z.string().trim().max(120),
  ownerParagraphs: lines(1500, 8),
  ownerClosing: lines(300, 6),
  ownerSignature: z.string().trim().max(120),
  ownerImage: imageDto.nullable(),
  crestIntro: z.string().trim().min(1).max(600),
  crestElements: z.array(crestElementDto).min(1).max(10),
  mission: z.string().trim().min(1).max(800),
  vision: z.string().trim().min(1).max(800),
});

// Only the fields that are sent are changed.
export const updateAboutDto = aboutFields.partial();

export type UpdateAboutInput = z.infer<typeof updateAboutDto>;
