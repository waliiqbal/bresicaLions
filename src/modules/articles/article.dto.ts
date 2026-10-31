import { z } from "zod";
import { htmlToText, sanitizeArticleHtml } from "@/lib/html";
import { imageDto } from "@/lib/images";
import { SLUG_PATTERN } from "@/lib/slug";
import { ARTICLE_CATEGORIES } from "./article.types";

const articleFields = z.object({
  title: z.string().trim().min(3, "Write a title (at least 3 letters).").max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(100)
    .regex(SLUG_PATTERN, "Use only lowercase letters, numbers and dashes.")
    .optional(),
  excerpt: z
    .string()
    .trim()
    .min(10, "Write a short summary (at least 10 letters).")
    .max(300, "Keep the summary under 300 letters."),
  content: z
    .string()
    .max(200_000)
    .transform(sanitizeArticleHtml)
    .refine((html) => htmlToText(html).length >= 20 || /<img/.test(html), {
      message: "Write the story (at least a couple of sentences).",
    }),
  category: z.enum(ARTICLE_CATEGORIES),
  image: imageDto.nullable().optional(),
  publishedAt: z.coerce.date().optional(),
  // No defaults here: an update that omits them must not reset them.
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export const reorderArticlesDto = z.object({
  ids: z.array(z.string().length(24)).min(1).max(500),
});

export const createArticleDto = articleFields;
export const updateArticleDto = articleFields.partial();

export type CreateArticleInput = z.infer<typeof createArticleDto>;
export type UpdateArticleInput = z.infer<typeof updateArticleDto>;
