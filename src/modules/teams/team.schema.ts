import mongoose, { Schema, type Model } from "mongoose";

export interface TeamDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  /** 2-3 letters shown inside the badge. */
  short: string;
  color: string;
  isLions: boolean;
  played: number;
  won: number;
  lost: number;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

const count = { type: Number, default: 0, min: 0 };

const teamSchema = new Schema<TeamDoc>(
  {
    name: { type: String, required: true, trim: true },
    short: { type: String, required: true, trim: true, uppercase: true },
    color: { type: String, default: "#1e4fa0" },
    isLions: { type: Boolean, default: false },
    played: count,
    won: count,
    lost: count,
    points: count,
  },
  { timestamps: true },
);

// Only one team can be the Lions, even if two requests create it at once.
teamSchema.index(
  { isLions: 1 },
  { unique: true, partialFilterExpression: { isLions: true } },
);

export const TeamModel: Model<TeamDoc> =
  (mongoose.models.Team as Model<TeamDoc> | undefined) ??
  mongoose.model<TeamDoc>("Team", teamSchema);
