import mongoose, { Schema, type Model } from "mongoose";

export interface StaffDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  role: string;
  bio: string;
  profile: string;
  experience: string;
  speciality: string;
  image?: { url: string; publicId?: string } | null;
  order: number;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<StaffDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    role: { type: String, required: true, trim: true },
    bio: { type: String, trim: true, default: "" },
    profile: { type: String, trim: true, default: "" },
    experience: { type: String, trim: true, default: "" },
    speciality: { type: String, trim: true, default: "" },
    image: {
      type: new Schema({ url: String, publicId: String }, { _id: false }),
      default: null,
    },
    order: { type: Number, default: 0, index: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const StaffModel: Model<StaffDoc> =
  (mongoose.models.Staff as Model<StaffDoc> | undefined) ??
  mongoose.model<StaffDoc>("Staff", staffSchema);
