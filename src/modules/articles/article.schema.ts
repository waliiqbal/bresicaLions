import mongoose, { Schema, type Model } from "mongoose";
import { ARTICLE_CATEGORIES, type ArticleCategory } from "./article.types";

export interface ArticleDoc {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  image?: { url: string; publicId?: string } | null;
  publishedAt: Date;
  published: boolean;
  featured: boolean;
  /** Position chosen by the admin (smallest first). Missing on very old stories. */
  order?: number;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<ArticleDoc>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, enum: ARTICLE_CATEGORIES, required: true },
    image: {
      type: new Schema({ url: String, publicId: String }, { _id: false }),
      default: null,
    },
    publishedAt: { type: Date, required: true, default: Date.now },
    published: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    order: { type: Number, index: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true },
);

articleSchema.index({ published: 1, publishedAt: -1 });

export const ArticleModel: Model<ArticleDoc> =
  (mongoose.models.Article as Model<ArticleDoc> | undefined) ??
  mongoose.model<ArticleDoc>("Article", articleSchema);
