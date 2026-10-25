import mongoose, { Schema, type Model } from "mongoose";

export interface SponsorDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  url?: string;
  logo?: { url: string; publicId?: string } | null;
  order: number;
  active: boolean;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sponsorSchema = new Schema<SponsorDoc>(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, trim: true, default: "" },
    logo: {
      type: new Schema({ url: String, publicId: String }, { _id: false }),
      default: null,
    },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const SponsorModel: Model<SponsorDoc> =
  (mongoose.models.Sponsor as Model<SponsorDoc> | undefined) ??
  mongoose.model<SponsorDoc>("Sponsor", sponsorSchema);
