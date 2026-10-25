import mongoose, { Schema, type Model } from "mongoose";

export interface MatchDoc {
  _id: mongoose.Types.ObjectId;
  homeTeam: mongoose.Types.ObjectId;
  awayTeam: mongoose.Types.ObjectId;
  date: Date;
  ground: string;
  status: "upcoming" | "completed";
  homeScore?: string;
  awayScore?: string;
  /** From the Lions' point of view. */
  result?: "won" | "lost" | "tie" | "no-result";
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema<MatchDoc>(
  {
    homeTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    awayTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    date: { type: Date, required: true },
    ground: { type: String, required: true, trim: true },
    status: { type: String, enum: ["upcoming", "completed"], default: "upcoming" },
    homeScore: { type: String, trim: true },
    awayScore: { type: String, trim: true },
    result: { type: String, enum: ["won", "lost", "tie", "no-result"] },
  },
  { timestamps: true },
);

matchSchema.index({ status: 1, date: 1 });

export const MatchModel: Model<MatchDoc> =
  (mongoose.models.Match as Model<MatchDoc> | undefined) ??
  mongoose.model<MatchDoc>("Match", matchSchema);
