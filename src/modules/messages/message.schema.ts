import mongoose, { Schema, type Model } from "mongoose";

export interface MessageDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  message: string;
  read: boolean;
  emailed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<MessageDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    emailed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageSchema.index({ createdAt: -1 });

export const MessageModel: Model<MessageDoc> =
  (mongoose.models.Message as Model<MessageDoc> | undefined) ??
  mongoose.model<MessageDoc>("Message", messageSchema);
