import mongoose, { Schema, type Model } from "mongoose";
import type { AboutStat, CrestElement } from "./about.types";

type StoredPicture = { url: string; publicId?: string } | null;

/**
 * One document holds the whole About Us content. Every field is optional:
 * a missing field falls back to the default text (about.defaults.ts).
 */
export interface AboutDoc {
  _id: mongoose.Types.ObjectId;
  key: "about";
  heading?: string;
  paragraphs?: string[];
  image?: StoredPicture;
  stats?: AboutStat[];
  history?: string[];
  historyClosing?: string[];
  historyImage?: StoredPicture;
  owner?: {
    name?: string;
    kicker?: string;
    paragraphs?: string[];
    closing?: string[];
    signature?: string;
    image?: StoredPicture;
  };
  crestIntro?: string;
  crestElements?: CrestElement[];
  mission?: string;
  vision?: string;
  updatedAt: Date;
}

const picture = new Schema({ url: String, publicId: String }, { _id: false });
const crestElement = new Schema(
  { title: String, subtitle: String, text: String },
  { _id: false },
);
const stat = new Schema({ label: String, value: String }, { _id: false });

const aboutSchema = new Schema<AboutDoc>(
  {
    key: { type: String, default: "about", unique: true },
    heading: String,
    paragraphs: { type: [String], default: undefined },
    image: { type: picture, default: undefined },
    stats: { type: [stat], default: undefined },
    history: { type: [String], default: undefined },
    historyClosing: { type: [String], default: undefined },
    historyImage: { type: picture, default: undefined },
    owner: {
      name: String,
      kicker: String,
      paragraphs: { type: [String], default: undefined },
      closing: { type: [String], default: undefined },
      signature: String,
      image: { type: picture, default: undefined },
    },
    crestIntro: String,
    crestElements: { type: [crestElement], default: undefined },
    mission: String,
    vision: String,
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

export const AboutModel: Model<AboutDoc> =
  (mongoose.models.About as Model<AboutDoc> | undefined) ??
  mongoose.model<AboutDoc>("About", aboutSchema);
