import mongoose, { Schema, type Model } from "mongoose";

/**
 * One document with the club's contact details, social links and footer text.
 * A field that was never saved is missing; the site then uses its default.
 */
export interface SettingsDoc {
  _id: mongoose.Types.ObjectId;
  key: "settings";
  email?: string;
  phone?: string;
  address?: string;
  socials?: {
    instagram?: string;
    facebook?: string;
    x?: string;
    youtube?: string;
    tiktok?: string;
  };
  footerText?: string;
  updatedAt: Date;
}

const settingsSchema = new Schema<SettingsDoc>(
  {
    key: { type: String, default: "settings", unique: true },
    email: String,
    phone: String,
    address: String,
    socials: {
      instagram: String,
      facebook: String,
      x: String,
      youtube: String,
      tiktok: String,
    },
    footerText: String,
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

export const SettingsModel: Model<SettingsDoc> =
  (mongoose.models.Settings as Model<SettingsDoc> | undefined) ??
  mongoose.model<SettingsDoc>("Settings", settingsSchema);
