import mongoose, { Schema, type Model } from "mongoose";
import { PLAYER_ROLES, type PlayerRole } from "./player.types";

export interface PlayerDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  number: number;
  role: PlayerRole;
  isCaptain: boolean;
  battingStyle: string;
  bowlingStyle: string;
  bio: string;
  image?: { url: string; publicId?: string } | null;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const playerSchema = new Schema<PlayerDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    number: { type: Number, required: true, min: 0, max: 999 },
    role: { type: String, enum: PLAYER_ROLES, required: true },
    isCaptain: { type: Boolean, default: false },
    battingStyle: { type: String, trim: true, default: "" },
    bowlingStyle: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    image: {
      type: new Schema({ url: String, publicId: String }, { _id: false }),
      default: null,
    },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true },
);

playerSchema.index({ number: 1, name: 1 });

export const PlayerModel: Model<PlayerDoc> =
  (mongoose.models.Player as Model<PlayerDoc> | undefined) ??
  mongoose.model<PlayerDoc>("Player", playerSchema);
