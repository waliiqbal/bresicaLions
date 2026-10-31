import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { removeStoredImage } from "@/lib/images";
import { escapeRegExp, uniqueSlug } from "@/lib/slug";
import type { CreateArticleInput, UpdateArticleInput } from "./article.dto";
import { ArticleModel, type ArticleDoc } from "./article.schema";
import {
  ARTICLE_CATEGORIES,
  type Article,
  type ArticleCategory,
} from "./article.types";

export function isArticleCategory(value: unknown): value is ArticleCategory {
  return ARTICLE_CATEGORIES.includes(value as ArticleCategory);
}

export function toArticle(doc: ArticleDoc): Article {
  return {
    id: String(doc._id),
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    content: doc.content,
    category: doc.category,
    image: doc.image?.url ?? "",
    imagePublicId: doc.image?.publicId || undefined,
    publishedAt: doc.publishedAt.toISOString(),
    published: doc.published,
    featured: doc.featured,
    isDemo: doc.isDemo,
  };
}

// ------------------------------------------------------------ public site

const PUBLIC = { published: true };
// Same publish date (it is a date, without time): the story uploaded last comes first.
const NEWEST = { publishedAt: -1, createdAt: -1 } as const;

/** Home page: published stories, newest first (the one uploaded last comes first). */
export async function getLatestArticles(limit = 100) {
  await connectDB();
  const docs = await ArticleModel.find(PUBLIC)
    .sort(NEWEST)
    .limit(limit)
    .lean<ArticleDoc[]>();
  return docs.map(toArticle);
}

interface ArticleFilters {
  category?: ArticleCategory;
  query?: string;
}

function publicFilter({ category, query }: ArticleFilters) {
  const filter: Record<string, unknown> = { ...PUBLIC };
  if (category) filter.category = category;

  const needle = query?.trim();
  if (needle) {
    const pattern = new RegExp(escapeRegExp(needle), "i");
    filter.$or = [{ title: pattern }, { excerpt: pattern }, { category: pattern }];
  }
  return filter;
}

export async function getArticles(filters: ArticleFilters = {}) {
  await connectDB();
  const docs = await ArticleModel.find(publicFilter(filters))
    .sort(NEWEST)
    .lean<ArticleDoc[]>();
  return docs.map(toArticle);
}

/** One page of the /news list (newest first). A page past the end gives the last page. */
export async function getArticlesPage(
  filters: ArticleFilters & { page?: number; pageSize?: number } = {},
) {
  await connectDB();
  const { page = 1, pageSize = 9, ...rest } = filters;
  const filter = publicFilter(rest);
  const total = await ArticleModel.countDocuments(filter);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  const docs = await ArticleModel.find(filter)
    .sort(NEWEST)
    .skip((current - 1) * pageSize)
    .limit(pageSize)
    .lean<ArticleDoc[]>();
  return { articles: docs.map(toArticle), total, page: current, pageCount };
}

/** Drafts are never returned, so a draft slug is a 404 on the public site. */
export async function getArticleBySlug(slug: string) {
  await connectDB();
  const doc = await ArticleModel.findOne({ ...PUBLIC, slug }).lean<ArticleDoc>();
  return doc ? toArticle(doc) : null;
}

export async function getArticleSlugs() {
  await connectDB();
  const docs = await ArticleModel.find(PUBLIC).select("slug").lean<ArticleDoc[]>();
  return docs.map((d) => d.slug);
}

/** Same category first, then the newest stories. */
export async function getRelatedArticles(article: Article, limit = 3) {
  await connectDB();
  const others = await ArticleModel.find({
    ...PUBLIC,
    _id: { $ne: article.id },
  })
    .sort(NEWEST)
    .lean<ArticleDoc[]>();
  const sameCategory = others.filter((a) => a.category === article.category);
  const rest = others.filter((a) => a.category !== article.category);
  return [...sameCategory, ...rest].slice(0, limit).map(toArticle);
}

// ------------------------------------------------------------ admin panel

export type ArticleStatusFilter = "all" | "published" | "draft";

export async function listArticlesForAdmin({
  query,
  status = "all",
}: { query?: string; status?: ArticleStatusFilter } = {}) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (status === "published") filter.published = true;
  if (status === "draft") filter.published = false;

  const needle = query?.trim();
  if (needle) {
    const pattern = new RegExp(escapeRegExp(needle), "i");
    filter.$or = [{ title: pattern }, { category: pattern }];
  }
  const docs = await ArticleModel.find(filter)
    .sort({ createdAt: -1 })
    .lean<ArticleDoc[]>();
  return docs.map(toArticle);
}

export async function countArticles() {
  await connectDB();
  const [published, drafts] = await Promise.all([
    ArticleModel.countDocuments({ published: true }),
    ArticleModel.countDocuments({ published: false }),
  ]);
  return { published, drafts };
}

export async function getArticleForAdmin(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const doc = await ArticleModel.findById(id).lean<ArticleDoc>();
  return doc ? toArticle(doc) : null;
}

type ServiceResult<T> =
  | { ok: true; article: T }
  | { ok: false; code: "not_found" | "slug_taken" | "needs_image"; message: string };

const NEEDS_IMAGE: ServiceResult<never> = {
  ok: false,
  code: "needs_image",
  message: "Add a cover image before publishing.",
};

const slugTaken = async (slug: string, exceptId?: string) =>
  Boolean(
    await ArticleModel.exists({
      slug,
      ...(exceptId ? { _id: { $ne: exceptId } } : {}),
    }),
  );

export async function createArticle(
  input: CreateArticleInput,
): Promise<ServiceResult<Article>> {
  await connectDB();
  const published = input.published ?? false;
  if (published && !input.image) return NEEDS_IMAGE;

  let slug = input.slug;
  if (slug) {
    if (await slugTaken(slug)) {
      return { ok: false, code: "slug_taken", message: "This web address is already used by another story." };
    }
  } else {
    slug = await uniqueSlug(input.title, (s) => slugTaken(s), "story");
  }

  const doc = await ArticleModel.create({
    title: input.title,
    slug,
    excerpt: input.excerpt,
    content: input.content,
    category: input.category,
    image: input.image ?? null,
    publishedAt: input.publishedAt ?? new Date(),
    published,
    featured: input.featured ?? false,
  });
  return { ok: true, article: toArticle(doc.toObject()) };
}

export async function updateArticle(
  id: string,
  input: UpdateArticleInput,
): Promise<ServiceResult<Article>> {
  if (!mongoose.isValidObjectId(id)) {
    return { ok: false, code: "not_found", message: "Story not found." };
  }
  await connectDB();
  const current = await ArticleModel.findById(id).lean<ArticleDoc>();
  if (!current) return { ok: false, code: "not_found", message: "Story not found." };

  const image = input.image === undefined ? current.image : input.image;
  const published = input.published ?? current.published;
  if (published && !image?.url) return NEEDS_IMAGE;

  if (input.slug && (await slugTaken(input.slug, id))) {
    return { ok: false, code: "slug_taken", message: "This web address is already used by another story." };
  }

  const update: Record<string, unknown> = {};
  for (const key of ["title", "slug", "excerpt", "content", "category", "publishedAt", "published", "featured"] as const) {
    if (input[key] !== undefined) update[key] = input[key];
  }
  if (input.image !== undefined) update.image = input.image;

  const saved = await ArticleModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean<ArticleDoc>();

  // The old cover is no longer used: free it on Cloudinary.
  if (input.image !== undefined && current.image?.publicId && current.image.publicId !== input.image?.publicId) {
    await removeStoredImage(current.image);
  }
  return { ok: true, article: toArticle(saved!) };
}

export async function deleteArticle(id: string) {
  if (!mongoose.isValidObjectId(id)) return false;
  await connectDB();
  const doc = await ArticleModel.findByIdAndDelete(id).lean<ArticleDoc>();
  if (!doc) return false;
  await removeStoredImage(doc.image);
  return true;
}
